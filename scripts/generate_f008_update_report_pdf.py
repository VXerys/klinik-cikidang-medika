"""Generate the F-008 client update report as a strictly black-and-white PDF.

Design rules enforced here:
- Only neutral grayscale values are used (no hue anywhere).
- Text is black or dark gray on white, with light gray rules and fills.
- Every table header is solid black with white text for high legibility.
"""

import os
import shutil

from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    HRFlowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# Grayscale only. Any color here would break the black-and-white requirement.
BLACK = colors.HexColor("#000000")
INK = colors.HexColor("#1A1A1A")
BODY = colors.HexColor("#333333")
MUTED = colors.HexColor("#666666")
RULE = colors.HexColor("#D4D4D4")
FILL_LIGHT = colors.HexColor("#F5F5F5")
FILL_MED = colors.HexColor("#E8E8E8")
WHITE = colors.HexColor("#FFFFFF")

DOC_TITLE = "Laporan Pembaruan Sistem (F-008)"
DOC_SUBTITLE = (
    "Sistem Informasi Manajemen Klinik Pratama Cikidang Medika"
)


class NumberedCanvas(canvas.Canvas):
    """Adds a plain header rule and page numbering to every page."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_decorations(page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def _draw_decorations(self, page_count):
        self.saveState()
        self.setFillColor(MUTED)
        self.setStrokeColor(RULE)
        self.setLineWidth(0.5)

        if self._pageNumber > 1:
            self.line(1.5 * cm, 28.6 * cm, 19.5 * cm, 28.6 * cm)
            self.setFont("Helvetica", 7.5)
            self.drawString(
                1.5 * cm,
                28.8 * cm,
                "Laporan Pembaruan Sistem F-008 - Klinik Pratama Cikidang Medika",
            )

        self.line(1.5 * cm, 1.6 * cm, 19.5 * cm, 1.6 * cm)
        self.setFont("Helvetica", 7.5)
        self.drawString(
            1.5 * cm,
            1.2 * cm,
            "Klinik Pratama Cikidang Medika - Jl. Raya Cikidang, Sukabumi",
        )
        self.drawRightString(19.5 * cm, 1.2 * cm, f"Halaman {self._pageNumber} dari {page_count}")
        self.restoreState()


def build_styles():
    base = getSampleStyleSheet()

    return {
        "title": ParagraphStyle(
            "Title",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=16,
            leading=20,
            textColor=BLACK,
            spaceAfter=2,
        ),
        "subtitle": ParagraphStyle(
            "Subtitle",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=MUTED,
            spaceAfter=9,
        ),
        "h1": ParagraphStyle(
            "H1",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11.5,
            leading=15,
            textColor=BLACK,
            spaceBefore=10,
            spaceAfter=4,
            keepWithNext=True,
        ),
        "h2": ParagraphStyle(
            "H2",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9.5,
            leading=13,
            textColor=INK,
            spaceBefore=7,
            spaceAfter=3,
            keepWithNext=True,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.6,
            leading=12.4,
            textColor=BODY,
            spaceAfter=5,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8.4,
            leading=12,
            textColor=BODY,
            leftIndent=11,
            firstLineIndent=-8,
            spaceAfter=2.5,
        ),
        "cell": ParagraphStyle(
            "Cell",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=7.7,
            leading=10.6,
            textColor=BODY,
        ),
        "cell_bold": ParagraphStyle(
            "CellBold",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.9,
            leading=10.8,
            textColor=BLACK,
        ),
        "cell_head": ParagraphStyle(
            "CellHead",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=7.9,
            leading=10.8,
            textColor=WHITE,
        ),
        "qna_q": ParagraphStyle(
            "QnAQ",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=9,
            leading=12.5,
            textColor=BLACK,
            spaceBefore=6,
            spaceAfter=2,
            keepWithNext=True,
        ),
        "sign": ParagraphStyle(
            "Sign",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            leading=11,
            textColor=BODY,
            alignment=1,
        ),
    }


def base_table_style(header_rows=1):
    """Shared grayscale styling for every data table."""
    style = [
        ("BACKGROUND", (0, 0), (-1, header_rows - 1), BLACK),
        ("TEXTCOLOR", (0, 0), (-1, header_rows - 1), WHITE),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.4, RULE),
        ("BOX", (0, 0), (-1, -1), 0.8, BLACK),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("LEFTPADDING", (0, 0), (-1, -1), 6),
        ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ]
    return style


def status_cell(text, done=True):
    """Status labels stay monochrome: bold black text on a gray chip."""
    fill = FILL_MED if done else FILL_LIGHT
    style = ParagraphStyle(
        f"Status{done}",
        parent=getSampleStyleSheet()["Normal"],
        fontName="Helvetica-Bold",
        fontSize=7.4,
        leading=9.6,
        textColor=BLACK,
        alignment=1,
        backColor=fill,
        borderColor=BLACK,
        borderWidth=0.4,
        borderPadding=3,
    )
    return Paragraph(text, style)


def build_report(output_paths):
    s = build_styles()
    story = []

    # ---------------------------------------------------------------- header
    story.append(Paragraph("KLINIK PRATAMA CIKIDANG MEDIKA", s["cell_bold"]))
    story.append(Spacer(1, 3))
    story.append(HRFlowable(width="100%", thickness=1.4, color=BLACK, spaceAfter=10))

    story.append(Paragraph(DOC_TITLE, s["title"]))
    story.append(Paragraph(DOC_SUBTITLE, s["subtitle"]))

    meta_rows = [
        [
            Paragraph("<b>Untuk:</b> dr. Ovan &amp; dr. Neneng (Pimpinan Klinik)", s["cell"]),
            Paragraph("<b>Dari:</b> Tim Pengembang Sistem", s["cell"]),
            Paragraph("<b>Tanggal:</b> 26 September 2026", s["cell"]),
        ],
        [
            Paragraph("<b>Perihal:</b> Laporan pembaruan fitur sesuai permintaan klien", s["cell"]),
            Paragraph("<b>Kode Paket Kerja:</b> F-008", s["cell"]),
            Paragraph("<b>Status:</b> Selesai dikerjakan &amp; lolos uji teknis", s["cell"]),
        ],
    ]
    t_meta = Table(meta_rows, colWidths=[7.4 * cm, 5.4 * cm, 5.2 * cm])
    t_meta.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), FILL_LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.8, BLACK),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, RULE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(t_meta)
    story.append(Spacer(1, 10))

    # ------------------------------------------------------------ ringkasan
    story.append(Paragraph("1. Ringkasan Singkat", s["h1"]))
    story.append(
        Paragraph(
            "Laporan ini merangkum seluruh pembaruan yang dikerjakan berdasarkan catatan dan permintaan "
            "pihak Klinik Pratama Cikidang Medika. Semua poin di bawah sudah diterapkan ke dalam sistem, "
            "kecuali dua hal yang masih menunggu keputusan klinik (dijelaskan pada Bagian 5). "
            "Bahasa laporan ini sengaja dibuat sederhana agar mudah dibaca oleh petugas loket, dokter, "
            "maupun pimpinan klinik.",
            s["body"],
        )
    )

    ringkas = [
        [
            Paragraph("Jumlah permintaan yang dipenuhi", s["cell_bold"]),
            Paragraph("<b>19 dari 21 poin</b> selesai diterapkan dan sudah diuji.", s["cell"]),
        ],
        [
            Paragraph("Menunggu keputusan klinik", s["cell_bold"]),
            Paragraph(
                "1 poin: besaran tarif komisi bidan untuk kriteria Infus, USG, dan Cek Lab.",
                s["cell"],
            ),
        ],
        [
            Paragraph("Dampak ke pekerjaan harian", s["cell_bold"]),
            Paragraph(
                "Pencatatan program kesehatan (PTM/ANC/KB/3 Eliminasi) dan rujukan bidan kini bisa "
                "dilakukan langsung di sistem, tanpa spreadsheet terpisah.",
                s["cell"],
            ),
        ],
        [
            Paragraph("Hak akses pengguna", s["cell_bold"]),
            Paragraph(
                "Kini hanya dua tipe pengguna: <b>Owner</b> dan <b>Dokter/Admin</b>, sesuai permintaan.",
                s["cell"],
            ),
        ],
    ]
    t_ringkas = Table(ringkas, colWidths=[5.6 * cm, 12.4 * cm])
    t_ringkas.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (0, -1), FILL_LIGHT),
                ("BOX", (0, 0), (-1, -1), 0.8, BLACK),
                ("INNERGRID", (0, 0), (-1, -1), 0.4, RULE),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ]
        )
    )
    story.append(t_ringkas)

    # ------------------------------------------------- daftar permintaan
    story.append(Paragraph("2. Daftar Permintaan Klien dan Statusnya", s["h1"]))
    story.append(
        Paragraph(
            "Tabel berikut adalah daftar permintaan yang Anda sampaikan, beserta status pengerjaannya. "
            "Kolom <b>Lokasi di Aplikasi</b> menunjukkan di menu mana perubahan tersebut bisa Anda lihat.",
            s["body"],
        )
    )

    permintaan = [
        ["No", "Permintaan", "Status", "Lokasi di Aplikasi"],
        ["1", "Nomor RM mengikuti alur: kode jenis kelamin - kode desa - nomor urut (00-00-000000)", "Selesai", "Loket & Kasir > Pasien Baru"],
        ["2", "Register khusus pasien ANC untuk pemantauan dan laporan Puskesmas", "Selesai", "Program Khusus > Program Kesehatan"],
        ["3", "Data HbSAg sebagai bagian pemeriksaan laboratorium ANC", "Selesai", "Program Khusus > Program Kesehatan > ANC"],
        ["4", "Laporan ke Puskesmas untuk PTM, ANC, KB, dan 3 Eliminasi", "Selesai", "Program Khusus > Program Kesehatan > tombol Unduh"],
        ["5", "Isian PTM: nama, jenis kelamin, TTL, alamat, NIK, diagnosa, lab", "Selesai", "Program Khusus > Program Kesehatan"],
        ["6", "Isian ANC: nama, jenis kelamin, TTL, alamat, NIK, diagnosa, terapi", "Selesai", "Program Khusus > Program Kesehatan"],
        ["7", "Isian KB: nama, TTL, alamat, NIK, jenis KB, tanggal kembali", "Selesai", "Program Khusus > Program Kesehatan"],
        ["8", "Isian 3 Eliminasi: nama, jenis kelamin, TTL, alamat, NIK, diagnosa, lab", "Selesai", "Program Khusus > Program Kesehatan"],
        ["9", "Rujukan dari bidan dicatat dan diakumulasi untuk komisi tahunan (kriteria infus, USG, cek lab)", "Selesai", "Laporan & Ekspor Excel > Komisi Rujukan Bidan"],
        ["10", "Hanya dua tipe pengguna: Owner dan Dokter/Admin", "Selesai", "Halaman Masuk (pemilihan peran)"],
        ["11", "Dokter/Admin tidak dapat melihat Dashboard", "Selesai", "Otomatis dibatasi sistem"],
        ["12", "Dokter/Admin tidak dapat mengakses Loket & Kasir serta Buku Kas", "Selesai", "Otomatis dibatasi sistem"],
        ["13", "Dokter/Admin tetap dapat melihat Program Khusus dan laporan program kesehatan", "Selesai", "Program Khusus & Laporan"],
        ["14", "Tombol Uang Pas harus langsung valid tanpa menambah angka nol", "Selesai", "Loket & Kasir > Pelunasan Kasir"],
        ["15", "Angka nol di depan dihapus otomatis saat mengisi biaya", "Selesai", "Loket & Kasir & Buku Kas"],
        ["16", "Pasien bisa berutang atau belum membayar", "Selesai", "Loket & Kasir > status Piutang / Belum Bayar"],
        ["17", "Tanda vital tidak diwajibkan saat pemeriksaan dokter", "Sudah sesuai", "Rekam Medis (tidak memblokir penyimpanan)"],
        ["18", "Data lama tetap tampil di Dashboard", "Sudah ada", "Dashboard (pilihan periode Semua Data)"],
        ["19", "Tampilan pilihan menu (dropdown) diseragamkan", "Selesai", "Seluruh formulir dan filter"],
        ["20", "Pertanyaan: di mana paket terapi cepat dan daftar obat dibuat", "Dijawab", "Lihat Bagian 5 laporan ini"],
        ["21", "Daftar nama desa pada formulir pasien dibersihkan dari duplikat", "Selesai", "Loket & Kasir > Pasien Baru"],
    ]

    rows = [[Paragraph(cell, s["cell_head"]) for cell in permintaan[0]]]
    for row in permintaan[1:]:
        status_text = row[2].upper()
        is_done = status_text not in ("MENUNGGU",)
        rows.append(
            [
                Paragraph(row[0], s["cell_bold"]),
                Paragraph(row[1], s["cell"]),
                status_cell(status_text, is_done),
                Paragraph(row[3], s["cell"]),
            ]
        )

    t_permintaan = Table(rows, colWidths=[1.0 * cm, 7.5 * cm, 2.4 * cm, 7.1 * cm], repeatRows=1)
    t_permintaan.setStyle(
        TableStyle(
            base_table_style()
            + [
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT]),
                ("ALIGN", (0, 0), (0, -1), "CENTER"),
                ("ALIGN", (2, 0), (2, -1), "CENTER"),
            ]
        )
    )
    story.append(t_permintaan)

    # ---------------------------------------------------- penjelasan detail
    story.append(Paragraph("3. Penjelasan Rinci Setiap Pembaruan", s["h1"]))
    story.append(
        Paragraph(
            "Bagian ini menjelaskan apa yang berubah dan bagaimana penggunaannya sehari-hari di klinik.",
            s["body"],
        )
    )

    detail_sections = [
        (
            "3.1 Nomor Rekam Medis Sesuai Alur Penginputan",
            [
                "Nomor RM pasien baru sekarang dibentuk dari tiga bagian yang dipisahkan tanda hubung, "
                "yaitu <b>kode jenis kelamin</b>, <b>kode desa</b>, lalu <b>nomor urut enam digit</b>. "
                "Contoh: <b>01-07-000001</b> berarti pasien laki-laki, berasal dari desa Sampora, "
                "dengan nomor urut pertama.",
                "Kode jenis kelamin: 01 untuk Laki-laki dan 02 untuk Perempuan. Kode desa mengikuti urutan "
                "daftar resmi klinik, mulai dari Cikidang (01) sampai Luar Daerah (13).",
                "Nomor urut terisi otomatis sehingga tidak ada nomor yang sama. Bila jenis kelamin atau desa "
                "diubah sebelum data disimpan, nomor RM ikut menyesuaikan sendiri, jadi petugas tidak perlu "
                "menghitung manual.",
                "Penting untuk diketahui: <b>nomor RM pasien lama tidak diubah</b>. Sistem tetap mengenali "
                "nomor lama, sehingga pencarian dan riwayat pasien lama tetap berjalan normal. Konversi nomor "
                "lama ke format baru dapat dilakukan menyusul bila klinik menghendaki.",
            ],
        ),
        (
            "3.2 Dua Tipe Pengguna dan Batas Aksesnya",
            [
                "Pengguna sistem kini dipecah menjadi dua peran saja sesuai permintaan: <b>Owner</b> "
                "(pimpinan klinik) dan <b>Dokter/Admin</b>.",
                "Peran <b>Dokter/Admin</b> dapat membuka: Pemeriksaan Dokter, Program Khusus (termasuk "
                "program kesehatan), serta laporan morbiditas penyakit untuk kebutuhan pelaporan Puskesmas.",
                "Peran <b>Dokter/Admin</b> tidak dapat membuka: Dashboard, Loket &amp; Kasir, dan Buku Kas. "
                "Pembatasan ini berlaku otomatis di sistem, bukan sekadar menyembunyikan tombol.",
                "Peran <b>Owner</b> tetap memiliki akses penuh ke seluruh menu dan data keuangan.",
                "Akun lama yang sebelumnya berperan sebagai kasir atau dokter otomatis dipindahkan ke peran "
                "Dokter/Admin, sehingga tidak ada akun yang mati saat pembaruan ini dijalankan.",
            ],
        ),
        (
            "3.3 Program Kesehatan: PTM, ANC, KB, dan 3 Eliminasi",
            [
                "Ada menu baru bernama <b>Program Kesehatan</b> di dalam halaman Program Khusus. Menu ini "
                "menjadi tempat pencatatan empat program sekaligus, dengan pilihan program di bagian atas "
                "formulir sehingga petugas cukup memilih jenis program lalu mengisi datanya.",
                "Setiap program memiliki kolom sesuai permintaan Anda. Khusus ANC, tersedia tambahan kolom "
                "terapi dan hasil pemeriksaan laboratorium HbSAg (Non Reaktif atau Reaktif) untuk pemantauan "
                "ibu hamil. Khusus KB, tersedia pilihan jenis KB dan tanggal kontrol kembali.",
                "Data bisa disaring per program (PTM, ANC, KB, 3 Eliminasi) dan dicari berdasarkan nama atau "
                "NIK.",
                "Tersedia tombol <b>Unduh Laporan Puskesmas</b> yang menghasilkan satu berkas Excel berisi "
                "lembar terpisah untuk setiap program. Jadi laporan PTM, ANC, KB, dan 3 Eliminasi tidak lagi "
                "perlu disusun manual dari spreadsheet.",
                "Karena data ini memuat NIK dan hasil laboratorium, sistem menampilkan pengingat kerahasiaan "
                "di bawah daftar, agar berkas hanya digunakan untuk keperluan pelaporan resmi.",
            ],
        ),
        (
            "3.4 Pencatatan Rujukan Bidan dan Komisi Tahunan",
            [
                "Ada menu baru <b>Komisi Rujukan Bidan</b> di halaman Laporan &amp; Ekspor Excel, khusus "
                "dapat dibuka oleh Owner. Menu ini menjadi tempat mencatat setiap pasien yang dirujuk bidan.",
                "Saat mencatat rujukan, petugas mengisi: nama bidan atau sumber rujukan, pasien yang dirujuk "
                "(opsional, bila pasien belum terdaftar tetap bisa dicatat), kriteria layanan (Infus, USG, "
                "atau Cek Lab), nominal komisi, tahun komisi, dan status pembayaran.",
                "Sistem kemudian menghitung akumulasi tahunan secara otomatis dan menampilkannya per bidan: "
                "jumlah rujukan, rincian berapa kali Infus, USG, dan Cek Lab, serta total komisi masing-masing.",
                "Ringkasan di bagian atas menu menampilkan tiga angka utama: total komisi setahun, komisi yang "
                "sudah dibayarkan, dan komisi yang belum dibayarkan. Dengan begitu pimpinan langsung tahu "
                "berapa kewajiban komisi yang masih tertunda.",
                "Seluruh data komisi dapat diunduh ke Excel untuk arsip dan pencocokan pembayaran.",
            ],
        ),
        (
            "3.5 Pembayaran, Pembulatan Nol, dan Status Berutang",
            [
                "Masukan tombol <b>Uang Pas</b> sudah diperbaiki. Sebelumnya nominal yang muncul belum "
                "lengkap sehingga petugas harus menambah angka nol sendiri. Sekarang sekali klik langsung "
                "terisi penuh dan bisa diproses tanpa langkah tambahan.",
                "Kolom pengisian biaya kini mengikuti format rupiah yang wajar. Saat petugas mengetik 200000, "
                "tampilannya otomatis menjadi <b>200.000</b>, dan angka nol di depan tidak lagi tersangkut.",
                "Ditambahkan status pembayaran baru untuk kondisi pasien yang belum melunasi: <b>Lunas</b>, "
                "<b>Piutang</b>, dan <b>Belum Bayar</b>, di samping status lama Ditanggung BPJS.",
                "Bila status Piutang dipilih, sistem menyimpan sisa tagihan beserta keterangannya, sehingga "
                "jumlah utang pasien tidak hilang dan tetap terlihat saat penagihan berikutnya.",
                "Catatan penting: wewenang menyetujui pelunasan piutang berada pada Owner, sesuai arahan Anda.",
            ],
        ),
        (
            "3.6 Kerapian Tampilan: Pilihan Menu dan Daftar Desa",
            [
                "Seluruh kolom pilihan di aplikasi kini memakai satu gaya tampilan yang sama, yaitu kotak "
                "putih membulat dengan tanda centang pada pilihan yang sedang aktif. Sebelumnya sebagian kolom "
                "masih memakai tampilan bawaan komputer yang berwarna biru dan berbeda-beda.",
                "Pilihan menu dengan daftar panjang, seperti desa dan jenis KB, otomatis memiliki kolom "
                "pencarian di dalamnya sehingga petugas tidak perlu menggulir panjang.",
                "Daftar desa pada formulir pasien dibersihkan. Sebelumnya muncul nama desa kembar "
                "(Tamansari, Gunungmalang, Bumiasih, Nangerang) yang membingungkan. Sekarang hanya muncul "
                "13 nama desa resmi sesuai daftar yang Anda kirim.",
                "Pasien lama yang datanya masih memakai nama desa versi lama tetap aman. Sistem "
                "menampilkan namanya sebagai data lama, sehingga tidak berubah diam-diam.",
            ],
        ),
    ]

    for heading, bullets in detail_sections:
        block = [Paragraph(heading, s["h2"])]
        for text in bullets:
            block.append(Paragraph(f"&bull;&nbsp; {text}", s["bullet"]))
        block.append(Spacer(1, 3))
        story.append(KeepTogether(block))

    story.append(PageBreak())

    # ------------------------------------------------------- jawaban tanya
    story.append(Paragraph("4. Jawaban atas Pertanyaan Anda", s["h1"]))
    story.append(
        Paragraph(
            "Anda menanyakan: <b>Untuk paket dan terapi cepat buatnya di mana? Dan bagaimana memasukkan "
            "daftar obat serta tindakan?</b> Berikut jawaban lengkapnya.",
            s["body"],
        )
    )

    story.append(Paragraph("4.1 Paket dan Terapi Cepat Dibuat di Mana?", s["h2"]))
    story.append(
        Paragraph(
            "Paket terapi cepat <b>digunakan</b> oleh dokter di halaman <b>Pemeriksaan Dokter</b>, tepatnya "
            "pada bagian <b>3. Terapi Obat &amp; Resep Apotek</b>. Di bagian itu dokter melihat tiga tombol "
            "paket siap pakai:",
            s["body"],
        )
    )
    paket_rows = [
        [Paragraph("Nama Paket", s["cell_head"]), Paragraph("Isi Paket", s["cell_head"])],
        [Paragraph("ISPA Dewasa", s["cell_bold"]), Paragraph("Amoxicillin, Paracetamol, CTM", s["cell"])],
        [Paragraph("Maag / Gastritis", s["cell_bold"]), Paragraph("Antasida, Omeprazole, Ranitidin", s["cell"])],
        [Paragraph("Alergi / Dermatitis", s["cell_bold"]), Paragraph("Cetirizine, Betametason Krim", s["cell"])],
    ]
    t_paket = Table(paket_rows, colWidths=[5.0 * cm, 13.0 * cm], repeatRows=1)
    t_paket.setStyle(
        TableStyle(base_table_style() + [("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT])])
    )
    story.append(t_paket)
    story.append(Spacer(1, 5))
    story.append(
        Paragraph(
            "Satu klik pada tombol paket akan langsung mengisi daftar obat di resep beserta aturan pakainya, "
            "sehingga dokter tidak perlu mengetik ulang. Dokter tetap bebas menambah, mengurangi, atau "
            "mengubah isi resep setelah paket diterapkan.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "<b>Penting:</b> daftar paket dan daftar obat tersebut saat ini <b>disimpan sebagai pengaturan "
            "di dalam program</b>, bukan diatur lewat menu aplikasi. Artinya, untuk menambah obat baru, "
            "mengubah aturan pakai, atau membuat paket baru, saat ini perlu bantuan pengembang untuk "
            "memperbaruinya lalu menerbitkan ulang aplikasi. Hal ini sudah kami catat sebagai usulan "
            "pengembangan berikutnya (lihat Bagian 5).",
            s["body"],
        )
    )

    story.append(Paragraph("4.2 Cara Memasukkan Daftar Obat", s["h2"]))
    story.append(
        Paragraph(
            "Ada tiga cara memasukkan obat saat dokter memeriksa pasien, semuanya di bagian "
            "<b>3. Terapi Obat &amp; Resep Apotek</b>:",
            s["body"],
        )
    )
    obat_bullets = [
        "<b>Cara 1 - Paket cepat:</b> klik salah satu tombol paket. Seluruh isi paket langsung masuk ke "
        "tabel resep.",
        "<b>Cara 2 - Cari dari katalog:</b> ketik sebagian nama obat di kolom pencarian (misalnya "
        "\"amox\" atau \"captopril\"), lalu pilih obat dari daftar yang muncul. Sistem sudah menyimpan "
        "Sistem sudah menyimpan 51 obat umum klinik pratama beserta dosis dan aturan pakainya, dari obat nyeri, "
        "antibiotik, obat lambung, alergi, hipertensi, diabetes, vitamin, sampai obat oles.",
        "<b>Cara 3 - Tulis bebas:</b> obat yang belum ada di katalog tetap bisa diketik langsung pada "
        "kolom catatan resep, sehingga tidak ada obat yang tertahan hanya karena belum terdaftar.",
        "Tersedia juga tombol sisip cepat untuk aturan pakai, seperti \"3x1 sesudah makan\" atau "
        "\"habiskan antibiotik\", agar penulisan resep lebih cepat dan seragam.",
        "Sistem otomatis mengingatkan bila obat yang diresepkan mengandung kata yang sama dengan riwayat "
        "alergi pasien, sebagai pengaman tambahan.",
    ]
    for text in obat_bullets:
        story.append(Paragraph(f"&bull;&nbsp; {text}", s["bullet"]))

    story.append(Paragraph("4.3 Cara Memasukkan Tindakan dan Pemeriksaan Lab", s["h2"]))
    story.append(
        Paragraph(
            "Tindakan medis dan pemeriksaan laboratorium diisi pada bagian <b>4. Tindakan Klinis &amp; Lab "
            "Point-of-Care</b> di halaman yang sama. Ada dua kolom:",
            s["body"],
        )
    )
    tindakan_bullets = [
        "<b>Pemeriksaan Lab Cepat:</b> mencatat jenis pemeriksaan dan hasilnya, misalnya GDS dengan hasil "
        "110 mg/dL, asam urat, Hb, atau kolesterol.",
        "<b>Tindakan Medis / Prosedur:</b> mencatat nama tindakan seperti nebulizer, injeksi, jahit luka, "
        "atau ganti balut, beserta catatan rinciannya bila diperlukan.",
        "Kolom tindakan dan lab saat ini masih berupa isian bebas. Artinya petugas mengetik nama tindakan "
        "sesuai kebutuhan, belum berupa daftar pilihan. Bila klinik menghendaki daftar tindakan yang bisa "
        "dipilih seperti daftar obat, hal ini dapat kami siapkan pada pengembangan berikutnya.",
        "Biaya tindakan dan obat yang dituliskan dokter akan otomatis diteruskan ke layar kasir saat "
        "pasien menuju pembayaran, sehingga kasir tidak perlu menanyakan ulang rinciannya.",
    ]
    for text in tindakan_bullets:
        story.append(Paragraph(f"&bull;&nbsp; {text}", s["bullet"]))

    # ------------------------------------------------- tunggu konfirmasi
    story.append(Paragraph("5. Hal yang Masih Menunggu Keputusan Klinik", s["h1"]))
    story.append(
        Paragraph(
            "Satu hal berikut sudah disiapkan wadahnya di sistem, tetapi isinya perlu ditetapkan lebih "
            "dulu oleh pihak klinik. Sistem tidak mengisi angka atau kebijakan apa pun tanpa "
            "persetujuan Anda.",
            s["body"],
        )
    )

    tunggu_rows = [
        [Paragraph("Hal", s["cell_head"]), Paragraph("Yang Dibutuhkan dari Klinik", s["cell_head"])],
        [
            Paragraph("<b>Besaran tarif komisi bidan</b>", s["cell_bold"]),
            Paragraph(
                "Sistem sudah bisa mencatat dan mengakumulasi komisi per bidan per tahun. Namun besaran "
                "rupiah untuk kriteria Infus, USG, dan Cek Lab belum ditetapkan. Saat ini petugas mengisi "
                "nominalnya secara manual. Mohon berikan angka resmi agar dapat kami jadikan acuan otomatis.",
                s["cell"],
            ),
        ],
    ]
    t_tunggu = Table(tunggu_rows, colWidths=[5.0 * cm, 13.0 * cm], repeatRows=1)
    t_tunggu.setStyle(
        TableStyle(base_table_style() + [("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT])])
    )
    story.append(t_tunggu)

    # ------------------------------------------------------------- catatan
    story.append(Paragraph("6. Hasil Pemeriksaan Berkas Data Klinik", s["h1"]))
    story.append(
        Paragraph(
            "Kami telah memeriksa berkas data klinik yang diberikan. Berkas tersebut berisi "
            "<b>7.493 baris catatan kunjungan</b> dengan <b>4.238 pasien unik</b>. Seluruh baris memiliki "
            "Nomor Rekam Medis, sehingga tidak ada pasien yang kehilangan nomor. Nomor RM lama tetap "
            "dipertahankan apa adanya, sesuai penjelasan pada Bagian 3.1.",
            s["body"],
        )
    )

    temuan_rows = [
        [Paragraph("Temuan Pemeriksaan", s["cell_head"]), Paragraph("Keterangan", s["cell_head"])],
        [
            Paragraph("Kelengkapan Nomor RM", s["cell"]),
            Paragraph("<b>Baik.</b> 4.238 pasien unik, tidak ada baris tanpa Nomor RM.", s["cell"]),
        ],
        [
            Paragraph("Data dokter dan penjamin", s["cell"]),
            Paragraph(
                "<b>Konsisten.</b> Hanya tiga nama petugas dan dua jenis penjamin (UMUM dan BPJS), "
                "sehingga pemetaannya dapat dilakukan otomatis dan rapi.",
                s["cell"],
            ),
        ],
        [
            Paragraph("Satu sel nomor BPJS terlalu panjang", s["cell"]),
            Paragraph(
                "<b>Sudah ditangani.</b> Ditemukan satu sel yang isinya bukan nomor BPJS melainkan teks "
                "yang salah masuk kolom. Sel tersebut dikosongkan agar tidak menyesatkan, karena memotong "
                "teks tersebut justru menghasilkan nomor palsu.",
                s["cell"],
            ),
        ],
        [
            Paragraph("Penulisan nama desa belum seragam", s["cell"]),
            Paragraph(
                "<b>Sudah ditangani.</b> 31 pasien memakai penulisan huruf kecil atau tidak seragam dan "
                "telah diseragamkan otomatis ke nama desa resmi saat pemindahan data.",
                s["cell"],
            ),
        ],
        [
            Paragraph("Metode pembayaran sebagian kosong", s["cell"]),
            Paragraph(
                "Sebagian besar catatan lama tidak mencantumkan metode pembayaran, sehingga "
                "dikategorikan sebagai Tunai. Mohon dikonfirmasi bila ada yang seharusnya Transfer.",
                s["cell"],
            ),
        ],
        [
            Paragraph("NIK dan nomor BPJS pasien lama", s["cell"]),
            Paragraph(
                "Sebagian besar pasien lama belum memiliki NIK maupun nomor BPJS pada catatan aslinya. "
                "Ini keterbatasan data sumber, bukan kehilangan data saat pemindahan.",
                s["cell"],
            ),
        ],
    ]
    t_temuan = Table(temuan_rows, colWidths=[5.2 * cm, 12.8 * cm], repeatRows=1)
    t_temuan.setStyle(
        TableStyle(base_table_style() + [("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT])])
    )
    story.append(t_temuan)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Pemindahan Data ke Basis Data Sistem", s["h2"]))

    hasil_rows = [
        [Paragraph("Komponen", s["cell_head"]), Paragraph("Jumlah Tercatat", s["cell_head"])],
        [Paragraph("Data pasien", s["cell"]), Paragraph("<b>4.238 pasien</b> (seluruhnya bernomor RM)", s["cell"])],
        [Paragraph("Data kunjungan", s["cell"]), Paragraph("<b>7.493 kunjungan</b>", s["cell"])],
        [Paragraph("Data arus kas", s["cell"]), Paragraph("<b>1.486 catatan kas</b>", s["cell"])],
        [
            Paragraph("Rentang data", s["cell"]),
            Paragraph("10 Agustus 2023 sampai 18 September 2026", s["cell"]),
        ],
        [
            Paragraph("Keterhubungan data", s["cell"]),
            Paragraph("<b>Rapi.</b> Tidak ada kunjungan yang kehilangan data pasien.", s["cell"]),
        ],
    ]
    t_hasil = Table(hasil_rows, colWidths=[5.2 * cm, 12.8 * cm], repeatRows=1)
    t_hasil.setStyle(
        TableStyle(base_table_style() + [("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT])])
    )
    story.append(t_hasil)
    story.append(Spacer(1, 6))

    story.append(Paragraph("Pemeriksaan Mutu Sistem", s["h2"]))
    uji_rows = [
        [Paragraph("Pemeriksaan", s["cell_head"]), Paragraph("Hasil", s["cell_head"])],
        [
            Paragraph("Pemeriksaan tipe data dan struktur program", s["cell"]),
            Paragraph("<b>Lulus</b> tanpa kesalahan", s["cell"]),
        ],
        [Paragraph("Pemeriksaan kaidah penulisan kode", s["cell"]), Paragraph("<b>Lulus</b> tanpa kesalahan", s["cell"])],
        [
            Paragraph("Proses pembuatan aplikasi versi produksi", s["cell"]),
            Paragraph("<b>Berhasil</b> diselesaikan tanpa hambatan", s["cell"]),
        ],
        [
            Paragraph("Struktur data baru di basis data", s["cell"]),
            Paragraph("<b>Terpasang</b> dan sudah diverifikasi keberadaannya", s["cell"]),
        ],
    ]
    t_uji = Table(uji_rows, colWidths=[9.0 * cm, 9.0 * cm], repeatRows=1)
    t_uji.setStyle(
        TableStyle(base_table_style() + [("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT])])
    )
    story.append(t_uji)
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "Seluruh riwayat kunjungan dan data pasien kini sudah tampil di Dashboard, termasuk saat "
            "memilih periode <i>Semua Data</i>. Masih diperlukan satu tahap terakhir, yaitu "
            "<b>pengujian langsung</b> oleh petugas klinik untuk memastikan seluruh alur berjalan mulus "
            "di komputer loket dan perangkat pimpinan.",
            s["body"],
        )
    )

    # ------------------------------------------------- usul pengembangan
    story.append(Paragraph("7. Usulan Pengembangan Lanjutan (Di Luar Lingkup Saat Ini)", s["h1"]))
    story.append(
        Paragraph(
            "Bagian ini kami sampaikan sebagai bahan pertimbangan, bukan bagian dari pekerjaan yang "
            "sedang berjalan. Sistem yang ada saat ini sudah dapat digunakan penuh tanpa tambahan di "
            "bawah ini.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Setiap klinik memiliki daftar obat, tarif tindakan, dan susunan paket terapi yang berbeda-beda. "
            "Saat ini daftar tersebut tersimpan sebagai pengaturan tetap di dalam program, sehingga belum "
            "dapat diubah sendiri oleh pihak klinik. Apabila klinik menghendaki agar daftar obat, tarif, dan "
            "paket terapi dapat dikelola sendiri, diperlukan tambahan layar pengelolaan data induk "
            "(master data) yang terpisah dari modul yang ada sekarang.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Penambahan layar tersebut merupakan modul baru yang berada di luar kesepakatan lingkup "
            "pekerjaan saat ini, sehingga perlu diajukan sebagai pekerjaan pengembangan lanjutan dengan "
            "penyesuaian biaya tersendiri. Tidak ada kewajiban untuk mengambilnya sekarang. Sementara ini, "
            "penyesuaian daftar obat atau paket terapi tetap dapat kami bantu lakukan atas permintaan klinik.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Bila pihak klinik berminat, kami siap menyusun rincian pekerjaan dan estimasi biayanya untuk "
            "ditinjau bersama sebelum diputuskan.",
            s["body"],
        )
    )

    # ------------------------------------------------------------ penutup
    story.append(Paragraph("8. Penutup", s["h1"]))
    story.append(
        Paragraph(
            "Seluruh pembaruan pada laporan ini sudah diterapkan ke dalam sistem, dan data klinik telah "
            "dipindahkan ke basis data pengujian tanpa mengubah Nomor RM pasien yang sudah ada. Kami "
            "mohon konfirmasi untuk satu hal pada Bagian 5, serta masukan atas usulan pada Bagian 7 bila "
            "diperlukan.",
            s["body"],
        )
    )
    story.append(Spacer(1, 8))

    sign_rows = [
        [
            Paragraph("Diajukan oleh,", s["sign"]),
            Paragraph("Diterima dan disetujui oleh,", s["sign"]),
        ],
        [
            Paragraph("<br/><br/><br/>__________________________<br/>Tim Pengembang Sistem", s["sign"]),
            Paragraph("<br/><br/><br/>__________________________<br/>Pimpinan Klinik Pratama Cikidang Medika", s["sign"]),
        ],
    ]
    t_sign = Table(sign_rows, colWidths=[9.0 * cm, 9.0 * cm])
    t_sign.setStyle(
        TableStyle(
            [
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(t_sign)

    # ----------------------------------------------------------------- build
    primary_path = output_paths[0]
    os.makedirs(os.path.dirname(primary_path), exist_ok=True)
    doc = SimpleDocTemplate(
        primary_path,
        pagesize=A4,
        leftMargin=1.5 * cm,
        rightMargin=1.5 * cm,
        topMargin=1.5 * cm,
        bottomMargin=1.8 * cm,
        title="Laporan Pembaruan Sistem F-008 - Klinik Pratama Cikidang Medika",
        author="Tim Pengembang Sistem",
    )
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Primary PDF built at: {primary_path}")

    for secondary_path in output_paths[1:]:
        try:
            os.makedirs(os.path.dirname(secondary_path), exist_ok=True)
            shutil.copyfile(primary_path, secondary_path)
            print(f"PDF copied to: {secondary_path}")
        except Exception as exc:  # noqa: BLE001
            print(f"Warning: could not copy to {secondary_path}: {exc}")


if __name__ == "__main__":
    destinations = [
        r"d:\Projects\klinik-cikidang-medika\docs\product\Laporan_Pembaruan_Sistem_F008.pdf",
        r"C:\Users\PLN\Downloads\Laporan_Pembaruan_Sistem_F008.pdf",
    ]
    build_report(destinations)
