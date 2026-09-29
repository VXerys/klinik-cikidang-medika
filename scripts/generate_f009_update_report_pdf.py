"""Generate the F-009 client update report as a strictly black-and-white PDF.

Design rules enforced here:
- Only neutral grayscale values are used (no hue anywhere).
- Text is black or dark gray on white, with light gray rules and fills.
- Every table header is solid black with white text for high legibility.

Every figure in this report was read back from the development database and the
reconciliation report, not estimated. Open items are listed as open.
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

DOC_TITLE = "Laporan Pembaruan Sistem (F-009)"
DOC_SUBTITLE = "Sistem Informasi Manajemen Klinik Pratama Cikidang Medika"
DOC_RUNNING = "Laporan Pembaruan Sistem F-009 - Klinik Pratama Cikidang Medika"


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
            self.drawString(1.5 * cm, 28.8 * cm, DOC_RUNNING)

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
        "cell_num": ParagraphStyle(
            "CellNum",
            parent=base["Normal"],
            fontName="Courier-Bold",
            fontSize=7.7,
            leading=10.6,
            textColor=INK,
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
    return [
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


def bullets(items, style):
    return [Paragraph(f"&bull;&nbsp; {text}", style) for text in items]


def plain_table(rows, col_widths, styles, zebra=True):
    """Build a table whose first row is a black header."""
    head = [Paragraph(cell, styles["cell_head"]) for cell in rows[0]]
    body = [[Paragraph(cell, styles["cell"]) for cell in row] for row in rows[1:]]
    table = Table([head] + body, colWidths=col_widths, repeatRows=1)
    extra = [("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT])] if zebra else []
    table.setStyle(TableStyle(base_table_style() + extra))
    return table


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
            Paragraph("<b>Tanggal:</b> 30 September 2026", s["cell"]),
        ],
        [
            Paragraph("<b>Perihal:</b> Kelengkapan data dan pembaruan fitur", s["cell"]),
            Paragraph("<b>Kode Paket Kerja:</b> F-009", s["cell"]),
            Paragraph("<b>Status:</b> Selesai di data uji, menunggu konfirmasi", s["cell"]),
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
            "Laporan ini merangkum pekerjaan tahap kelanjutan setelah laporan F-008. Fokus tahap ini ada "
            "dua: <b>menutup seluruh selisih data</b> antara Google Sheets dan aplikasi, serta "
            "<b>menambahkan empat permintaan</b> yang Anda sampaikan. Semua pekerjaan sudah diterapkan ke "
            "<b>data uji</b>. Data produksi sengaja belum disentuh sampai hasil di data uji Anda setujui.",
            s["body"],
        )
    )

    ringkas = [
        [
            Paragraph("Data yang diselaraskan", s["cell_bold"]),
            Paragraph(
                "<b>4.703 pasien</b>, <b>7.671 kunjungan</b>, dan <b>1.552 catatan kas</b> "
                "sampai 29 September 2026. Tidak ada lagi identitas pasien ganda.",
                s["cell"],
            ),
        ],
        [
            Paragraph("Register program kesehatan", s["cell_bold"]),
            Paragraph(
                "<b>810 catatan</b> terbentuk dari kolom pemantauan pada catatan kunjungan: "
                "ANC 594, PTM 139, KB 36, dan 3 Eliminasi 41.",
                s["cell"],
            ),
        ],
        [
            Paragraph("Empat permintaan Anda", s["cell_bold"]),
            Paragraph(
                "Pemantauan rujukan bidan, filter periode satu tanggal atau rentang, laporan Puskesmas, "
                "dan register sunat beserta fitur edit untuk melengkapi tanggal serta foto.",
                s["cell"],
            ),
        ],
        [
            Paragraph("Yang masih menunggu klinik", s["cell_bold"]),
            Paragraph(
                "Pengisian tanggal tindakan dan foto pada <b>43 baris register sunat</b>, serta "
                "keputusan atas <b>287 nomor RM tidak beraturan</b>. Rinciannya di Bagian 5.",
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
    story.append(Paragraph("2. Daftar Permintaan Anda dan Statusnya", s["h1"]))
    story.append(
        Paragraph(
            "Tabel berikut adalah permintaan yang Anda sampaikan pada tahap ini, beserta status "
            "pengerjaannya. Kolom <b>Lokasi di Aplikasi</b> menunjukkan di menu mana perubahan tersebut "
            "dapat Anda lihat.",
            s["body"],
        )
    )

    permintaan = [
        ["No", "Permintaan", "Status", "Lokasi di Aplikasi"],
        ["1", "Pastikan tidak ada data Google Sheets yang tertinggal di aplikasi", "Selesai", "Dashboard &amp; Laporan"],
        ["2", "Buka satu bidan lalu lihat riwayat rujukannya", "Selesai", "Laporan &gt; Rujukan Bidan"],
        ["3", "Filter periode bisa satu tanggal atau rentang tanggal", "Selesai", "Dashboard &amp; Laporan (pilihan Periode)"],
        ["4", "Laporan siap diserahkan ke Puskesmas mengikuti sheet LAPORAN DPP", "Dikonfirmasi", "Laporan &gt; Puskesmas"],
        ["5", "Tampilan tabel laporan dibuat menyerupai spreadsheet sumber", "Selesai", "Laporan (semua tab)"],
        ["6", "Register sunat tetap dibuat walaupun sumbernya tidak memuat tanggal", "Selesai", "Program Khusus &gt; Sunat"],
        ["7", "Kolom tanggal tindakan tetap ada dan bisa diisi kemudian", "Selesai", "Program Khusus &gt; Sunat &gt; Edit"],
        ["8", "Foto medis sunat bisa diunggah lewat menu edit", "Selesai", "Program Khusus &gt; Sunat &gt; Edit"],
    ]

    rows = [[Paragraph(cell, s["cell_head"]) for cell in permintaan[0]]]
    for row in permintaan[1:]:
        status_text = row[2].upper()
        rows.append(
            [
                Paragraph(row[0], s["cell_bold"]),
                Paragraph(row[1], s["cell"]),
                status_cell(status_text, status_text != "MENUNGGU"),
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
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            "Status <b>Dikonfirmasi</b> pada baris 4 berarti layout laporan Puskesmas yang sudah "
            "dikerjakan sesuai dengan contoh sheet klinik, dan tidak perlu diubah.",
            s["body"],
        )
    )

    # ---------------------------------------------------- penjelasan detail
    story.append(Paragraph("3. Penjelasan Rinci Setiap Pembaruan", s["h1"]))
    story.append(
        Paragraph(
            "Bagian ini menjelaskan apa yang berubah dan bagaimana pemakaiannya sehari-hari di klinik.",
            s["body"],
        )
    )

    detail_sections = [
        (
            "3.1 Kelengkapan Data: Tidak Ada Lagi Data Sheets yang Tertinggal",
            [
                "Sumber pemindahan data dinaikkan ke berkas ekspor terbaru, yaitu "
                "<b>REKAMMEDIS.csv</b> (ekspor 29 September 2026). Berkas ini memuat seluruh isi ekspor "
                "sebelumnya ditambah data terbaru, sehingga tidak ada baris lama yang hilang.",
                "Jumlah pasien naik dari <b>4.238</b> menjadi <b>4.703</b>, dan kunjungan dari "
                "<b>7.493</b> menjadi <b>7.671</b>. Rentang data kini mencakup <b>10 Agustus 2023 sampai "
                "29 September 2026</b>.",
                "Ditemukan <b>254 pasangan identitas ganda</b>. Penyebabnya adalah Google Sheets "
                "menyimpan nomor RM sebagai angka, sehingga angka nol di depan hilang. Contohnya "
                "<b>020200002</b> dan <b>20200002</b> tercatat sebagai dua pasien berbeda padahal orang "
                "yang sama. Seluruh pasangan tersebut sudah digabung, dan jumlahnya kini <b>0</b>.",
                "Sebanyak <b>945 nomor RM</b> yang kehilangan angka nol di depan dikembalikan ke bentuk "
                "9 digit. Nomor versi lama tidak dibuang, melainkan disimpan pada kolom terpisah sehingga "
                "pencarian memakai nomor lama tetap berhasil.",
                "<b>617 pasien</b> yang datanya ada di berkas data pasien tetapi belum pernah tercatat "
                "berkunjung juga ikut dimasukkan, sesuai permintaan Anda agar tidak ada data yang "
                "tertinggal.",
                "Data pelengkap pasien ikut diisi: <b>pekerjaan</b> untuk 3.597 pasien dan "
                "<b>riwayat alergi obat</b> untuk 1.980 pasien. Sebelumnya kolom alergi hanya berisi "
                "nilai bawaan sistem, bukan data sebenarnya. Data alergi ini penting karena sistem "
                "memberi peringatan saat dokter meresepkan obat yang mirip dengan alergi pasien.",
            ],
        ),
        (
            "3.2 Pemantauan Rujukan Bidan",
            [
                "Ada tab baru bernama <b>Rujukan Bidan</b> di halaman Laporan. Data rujukan ini sebenarnya "
                "sudah tersimpan di catatan kunjungan sejak lama, tetapi belum pernah bisa dibuka per bidan.",
                "Tab ini menampilkan daftar seluruh bidan beserta <b>jumlah rujukan</b> dan "
                "<b>jumlah pasien</b> yang dirujuk. Saat ini tercatat <b>82 rujukan dari 9 bidan</b>.",
                "Cukup dua klik untuk melihat riwayat: klik nama bidan di daftar, lalu rincian rujukannya "
                "muncul berisi nama pasien, nomor RM, tanggal kunjungan, kode ICD-10, dan tindakan yang "
                "dilakukan.",
                "Tab ini juga mengikuti filter periode. Bila Anda memilih satu bulan, hanya rujukan pada "
                "bulan itu yang ditampilkan. Bila bidan tersebut belum ada rujukan pada periode itu, "
                "muncul keterangan jelas, bukan halaman kosong.",
                "Catatan penting: tab ini baru sebatas <b>pemantauan</b>. Perhitungan dan pembayaran "
                "komisi bidan tetap berada di menu <b>Komisi Rujukan Bidan</b> seperti sebelumnya, dan "
                "besaran tarifnya masih menunggu angka resmi dari klinik.",
            ],
        ),
        (
            "3.3 Filter Periode: Satu Tanggal atau Rentang Tanggal",
            [
                "Sebelumnya pilihan periode hanya berupa empat tombol tetap. Sekarang ada mode "
                "<b>Kustom</b> yang menerima <b>satu tanggal saja</b> atau <b>rentang dua tanggal</b>, "
                "sesuai kebutuhan Anda.",
                "Empat pilihan cepat lama tetap ada (hari ini, bulan ini, tahun ini, semua data), sehingga "
                "kebiasaan lama tidak berubah. Pilihan cepat tersebut otomatis diterjemahkan menjadi "
                "rentang tanggal yang setara.",
                "Bila tanggal akhir yang dipilih lebih awal daripada tanggal awal, sistem menolak dan "
                "menampilkan pesan yang jelas, bukan menampilkan hasil kosong yang membingungkan.",
                "Saat memilih rentang, bila baru satu tanggal yang terisi, sistem belum menjalankan "
                "pencarian dan memberi tahu tanggal mana yang masih perlu diisi. Jadi tampilan tidak "
                "berkedip atau kosong di tengah pengisian.",
                "Filter periode yang sama dipakai di Dashboard, halaman Laporan, tab Rujukan Bidan, dan "
                "tab Puskesmas. Masing-masing halaman menyimpan periodenya sendiri, sehingga mengubah "
                "periode di satu halaman tidak mengubah halaman lain.",
            ],
        ),
        (
            "3.4 Laporan Puskesmas",
            [
                "Ada tab baru bernama <b>Puskesmas</b> di halaman Laporan. Tab ini menyusun register per "
                "program (PTM, ANC, KB, dan 3 Eliminasi) untuk periode yang dipilih, dengan urutan dan "
                "nama kolom mengikuti sheet <b>LAPORAN DPP</b> milik klinik.",
                "Periode yang dipilih ditampilkan di atas tabel, sehingga salinan cetak atau berkas yang "
                "dikirim ke Puskesmas sudah menjelaskan dirinya sendiri dan tidak perlu diberi keterangan "
                "tambahan secara manual.",
                "Tersedia tombol unduh <b>berkas Excel (.xlsx)</b> berisi seluruh baris pada periode itu, "
                "sehingga laporan Puskesmas tidak lagi perlu disusun ulang dari spreadsheet.",
                "Karena tabelnya panjang, judul kolom tetap terlihat saat isi tabel digulir ke bawah, dan "
                "tabel dapat digulir ke samping tanpa membuat seluruh halaman ikut bergeser. Dengan "
                "begitu tabel tetap nyaman dibuka dari layar komputer loket maupun tablet.",
            ],
        ),
        (
            "3.5 Register Sunat: Kolom Tanggal Tetap Ada dan Bisa Diedit",
            [
                "Register sunat dari sheet <b>SUNAT</b> sudah dimasukkan seluruhnya, yaitu "
                "<b>43 anak</b>. Data yang masuk mencakup nama, tanggal lahir, alamat, kelurahan, usia, "
                "jenis kelamin, berat badan, dan nomor telepon.",
                "Sheet SUNAT milik klinik <b>tidak memuat kolom tanggal tindakan</b>, dan lima kolom foto "
                "pasca sunat di dalamnya juga kosong. Karena itu tanggal tindakan sengaja dikosongkan, "
                "bukan diisi tanggal karangan. Kolom tanggal tindakan <b>tetap ada</b> dan tidak dihapus.",
                "Baris yang belum bertanggal ditandai <b>Belum tercatat</b> pada kartunya, dan seluruh "
                "baris tersebut diurutkan paling atas. Di atas daftar muncul keterangan berapa baris yang "
                "masih perlu dilengkapi, sehingga ini menjadi daftar kerja yang jelas, bukan data yang "
                "hilang.",
                "Setiap kartu kini memiliki tombol <b>Edit</b>. Lewat form edit tersebut petugas dapat "
                "mengisi atau memperbaiki: tanggal tindakan, berat badan, dokter pelaksana, metode "
                "tindakan, biaya, kondisi luka, dan catatan.",
                "Form edit yang sama juga menjadi tempat mengunggah <b>dua foto medis</b> (foto sebelum "
                "dan sesudah). Foto dapat diambil langsung dari kamera perangkat atau dipilih dari galeri, "
                "diganti, dan dihapus. Sebelum dikirim, foto otomatis diperkecil ke format WebP di bawah "
                "300 KB agar tidak membebani penyimpanan dan tetap cepat dibuka di jaringan klinik.",
                "Sebanyak <b>9 baris</b> sunat membawa catatan pemeriksaan karena perlu diperiksa lebih "
                "dulu. Empat baris memakai nama yang berbeda dari nama pasien pada data induk, dan lima "
                "baris memiliki tanggal lahir yang sama dengan pasien bernama lain. Catatan tersebut "
                "muncul di dalam form edit agar petugas dapat memverifikasi sebelum menyimpan.",
            ],
        ),
    ]

    for heading, items in detail_sections:
        block = [Paragraph(heading, s["h2"])] + bullets(items, s["bullet"]) + [Spacer(1, 3)]
        story.append(KeepTogether(block))

    # ------------------------------------------------------- jawaban tanya
    story.append(Paragraph("4. Jawaban atas Tiga Pertanyaan Anda", s["h1"]))
    story.append(
        Paragraph(
            "Pada pemeriksaan sebelumnya kami mengangkat tiga hal untuk Anda putuskan. Berikut jawaban "
            "dan tindakannya.",
            s["body"],
        )
    )

    story.append(Paragraph("4.1 Kolom Tanggal Tindakan pada Data Sunat", s["h2"]))
    story.append(
        Paragraph(
            "Anda meminta kolom tanggal tindakan tetap dipertahankan, dan baris yang belum bertanggal "
            "dapat dilengkapi oleh petugas klinik kemudian. Permintaan itu <b>sudah dipenuhi</b>. Kolom "
            "tanggal tindakan tidak dihapus, hanya statusnya diubah dari <i>wajib diisi</i> menjadi "
            "<i>dapat dikosongkan dahulu</i>. Setiap kartu sunat memiliki tombol Edit untuk mengisi "
            "tanggal, dan form yang sama juga dipakai untuk mengunggah dua foto medis.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Satu temuan tambahan yang mungkin membantu: setelah kami periksa ulang, tanggal tindakan "
            "untuk <b>13 dari 43 baris</b> ternyata dapat ditelusuri dari catatan kunjungan yang sudah "
            "ada di sistem, karena kunjungan tersebut mencantumkan tindakan sunat pada diagnosis atau "
            "keluhan. Dari 13 data itu, satu baris merupakan kunjungan kontrol hari ketiga, sehingga "
            "tanggalnya bukan tanggal tindakan. Kami <b>belum</b> mengisinya, karena ini menyangkut isi "
            "rekam medis dan lebih baik Anda putuskan lebih dulu. Bila Anda setuju, kami dapat "
            "mengisikan 12 tanggal tersebut sebagai titik awal, dan sisanya tetap dilengkapi petugas "
            "lewat form Edit.",
            s["body"],
        )
    )

    story.append(Paragraph("4.2 Nomor RM yang Tidak Beraturan", s["h2"]))
    story.append(
        Paragraph(
            "Anda menanyakan rekomendasi kami untuk nomor RM yang panjangnya 10 digit. Setelah diperiksa, "
            "nomor tersebut <b>tidak semuanya keliru</b>, dan perlu dipisahkan menjadi tiga kelompok:",
            s["body"],
        )
    )

    rm_rows = [
        ["Kelompok", "Jumlah", "Sifat", "Rekomendasi Kami"],
        [
            "Nomor 10 digit asli klinik (contoh 2010000116)",
            "280",
            "Nomor lama buatan klinik sendiri, masing-masing unik dan tetap terbaca sistem",
            "Biarkan apa adanya. Tidak ada manfaat menulis ulang, sedangkan risikonya ada karena nomor ini "
            "sudah tercetak di kartu berobat pasien.",
        ],
        [
            "Nomor pendek, 7 digit dan 5 digit",
            "6",
            "Kemungkinan kehilangan angka nol di depan, sama seperti kasus 254 pasangan ganda sebelumnya",
            "Enam nomor ini sudah kami uji dan <b>tidak bentrok</b> dengan nomor lain. Dapat dipulihkan ke "
            "9 digit setelah Anda setujui, dan nomor lamanya tetap disimpan.",
        ],
        [
            "Satu isian berisi teks \"gatal gatal\"",
            "1",
            "Keluhan pasien salah masuk ke kolom nomor RM pada spreadsheet sumber",
            "Perlu nomor RM yang benar dari klinik. Sistem tidak menebak. Saat ini kolom nomor RM tidak "
            "dapat diubah sendiri dari menu Edit Pasien, jadi perbaikannya kami bantu lakukan.",
        ],
    ]
    t_rm = Table(
        [[Paragraph(cell, s["cell_head"]) for cell in rm_rows[0]]]
        + [
            [
                Paragraph(row[0], s["cell_bold"]),
                Paragraph(row[1], s["cell_num"]),
                Paragraph(row[2], s["cell"]),
                Paragraph(row[3], s["cell"]),
            ]
            for row in rm_rows[1:]
        ],
        colWidths=[4.2 * cm, 1.7 * cm, 4.4 * cm, 7.7 * cm],
        repeatRows=1,
    )
    t_rm.setStyle(
        TableStyle(
            base_table_style()
            + [
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT]),
                ("ALIGN", (1, 0), (1, -1), "CENTER"),
            ]
        )
    )
    story.append(t_rm)
    story.append(Spacer(1, 5))
    story.append(
        Paragraph(
            "<b>Ringkas jawaban kami:</b> dari 287 nomor yang bentuknya tidak seragam, <b>280 nomor "
            "bukan masalah</b> dan sebaiknya dibiarkan. Hanya <b>7 nomor</b> yang benar-benar perlu "
            "tindakan, dan itupun sangat sedikit. Jadi ya, persoalan ini cukup kami cantumkan di laporan "
            "seperti ini sebagai daftar keputusan, tanpa perlu menghentikan pemakaian sistem atau "
            "memaksakan penulisan ulang seluruh nomor RM pasien lama.",
            s["body"],
        )
    )
    story.append(
        Paragraph(
            "Satu catatan tambahan: pada data induk ditemukan <b>satu pasien yang kolom namanya berisi "
            "kode ICD-10</b>, yaitu <b>J00</b>. Kemungkinan kode diagnosis salah masuk kolom nama. Data "
            "ini kami biarkan apa adanya dan kami laporkan agar klinik memutuskan nama yang benar.",
            s["body"],
        )
    )

    story.append(Paragraph("4.3 Layout Laporan Puskesmas", s["h2"]))
    story.append(
        Paragraph(
            "Anda menyatakan layout laporan Puskesmas <b>sudah benar</b>. Kami catat sebagai hal yang "
            "sudah dikonfirmasi, dan tidak ada perubahan layout pada tahap ini. Pertanyaan terbuka "
            "tersebut kami tutup.",
            s["body"],
        )
    )

    # ------------------------------------------------- tunggu konfirmasi
    story.append(Paragraph("5. Hal yang Masih Menunggu Keputusan Klinik", s["h1"]))
    story.append(
        Paragraph(
            "Empat hal berikut <b>belum</b> kami putuskan sendiri, karena menyangkut isi rekam medis atau "
            "kebijakan klinik. Sistem tidak mengisi data yang tidak diketahui, dan tidak menebak. "
            "Mohon berikan arahan pada masing-masing poin.",
            s["body"],
        )
    )

    tunggu_rows = [
        ["No", "Hal", "Yang Dibutuhkan dari Klinik", "Yang Kami Sarankan"],
        [
            "1",
            "Tanggal tindakan 43 baris register sunat",
            "Klinik mengisi tanggal lewat tombol Edit di daftar sunat, atau menyetujui kami memakai 12 "
            "tanggal yang dapat ditelusuri dari catatan kunjungan (lihat 4.1).",
            "Pakai 12 tanggal hasil penelusuran, lalu lengkapi sisanya lewat form Edit. Lebih cepat dan "
            "tetap akurat karena sumbernya catatan klinik sendiri.",
        ],
        [
            "2",
            "Foto medis sunat",
            "Foto tidak ada di sheet SUNAT, jadi tidak dapat kami pindahkan. Petugas mengunggahnya lewat "
            "form Edit (kamera atau galeri), sistem otomatis memperkecil berkasnya.",
            "Mulai dari pasien yang paling baru dioperasi, agar dokumentasi foto patuh pada pasien yang "
            "masih dalam masa pemantauan.",
        ],
        [
            "3",
            "287 nomor RM tidak beraturan",
            "Konfirmasi agar 6 nomor pendek dipulihkan ke 9 digit, dan nomor RM yang benar untuk satu "
            "isian yang berisi teks \"gatal gatal\".",
            "Pulihkan 6 nomor pendek (sudah diuji tidak bentrok) dan biarkan 280 nomor 10 digit apa "
            "adanya.",
        ],
        [
            "4",
            "9 baris sunat yang perlu diverifikasi",
            "Empat baris memakai nama berbeda dari data induk dan lima baris punya tanggal lahir yang "
            "sama dengan pasien lain. Catatan sudah tertulis di dalam form Edit masing-masing.",
            "Periksa kesembilan baris tersebut saat mengisi tanggal tindakan, karena keduanya dikerjakan "
            "di tempat yang sama.",
        ],
    ]
    t_tunggu = Table(
        [[Paragraph(cell, s["cell_head"]) for cell in tunggu_rows[0]]]
        + [
            [
                Paragraph(row[0], s["cell_bold"]),
                Paragraph(row[1], s["cell_bold"]),
                Paragraph(row[2], s["cell"]),
                Paragraph(row[3], s["cell"]),
            ]
            for row in tunggu_rows[1:]
        ],
        colWidths=[0.9 * cm, 4.0 * cm, 6.6 * cm, 6.5 * cm],
        repeatRows=1,
    )
    t_tunggu.setStyle(
        TableStyle(
            base_table_style()
            + [
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, FILL_LIGHT]),
                ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ]
        )
    )
    story.append(t_tunggu)

    # ------------------------------------------------------------- catatan
    story.append(Paragraph("6. Hasil Pemeriksaan Berkas Data Klinik", s["h1"]))
    story.append(
        Paragraph(
            "Kami telah memeriksa berkas data terbaru dari klinik. Berikut perbandingan kondisi data "
            "sebelum dan sesudah penyelarasan.",
            s["body"],
        )
    )

    hasil_rows = [
        ["Komponen Data", "Sebelum", "Sesudah", "Keterangan"],
        ["Data pasien", "4.238 pasien", "4.703 pasien", "Bertambah 465, termasuk 617 pasien yang belum pernah berkunjung"],
        ["Identitas pasien ganda", "254 pasangan", "0", "Seluruh pasangan sudah digabung menjadi satu identitas"],
        ["Kunjungan", "7.493 (s/d 18 Sep)", "7.671 (s/d 29 Sep)", "Bertambah 178 kunjungan terbaru"],
        ["Catatan kas", "1.486", "1.552", "Bertambah 66 catatan"],
        ["Register program kesehatan", "0", "810 catatan", "ANC 594, PTM 139, KB 36, 3 Eliminasi 41"],
        ["Register sunat", "0", "43 anak", "Tanggal tindakan menyusul, diisi lewat form Edit"],
        ["Rujukan bidan", "80", "82 rujukan", "Dari 9 bidan, kini dapat dibuka per bidan"],
        ["Rentang data", "s/d 18 September 2026", "s/d 29 September 2026", "Selisih data terbaru sudah masuk"],
    ]
    t_hasil = plain_table(hasil_rows, [4.4 * cm, 3.3 * cm, 3.4 * cm, 6.9 * cm], s)
    story.append(t_hasil)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Temuan Pemeriksaan", s["h2"]))
    temuan_rows = [
        ["Temuan", "Keterangan"],
        [
            "Kelengkapan nomor RM",
            "<b>Baik.</b> Tidak ada pasien tanpa nomor RM, dan tidak ada kunjungan yang kehilangan "
            "data pasiennya.",
        ],
        [
            "Nomor RM tidak beraturan",
            "<b>287 nomor</b> bentuknya tidak seragam. Rinciannya pada Bagian 4.2. Dibiarkan apa adanya "
            "sampai klinik memutuskan, karena sistem tidak menebak identitas pasien.",
        ],
        [
            "Tanggal tindakan sunat tidak ada di sumber",
            "<b>Terkendali.</b> Tidak kami karang. Baris tersebut dijadikan daftar kerja di aplikasi, "
            "dan 12 di antaranya masih dapat ditelusuri dari catatan kunjungan bila Anda setuju.",
        ],
        [
            "Satu nama pasien berisi kode ICD",
            "<b>Perlu keputusan.</b> Satu pasien bernama <b>J00</b>. Dibiarkan apa adanya agar tidak "
            "menimpa nama yang mungkin masih dipakai.",
        ],
        [
            "Penulisan pekerjaan pasien belum seragam",
            "<b>Catatan kecil.</b> Nilainya benar, tetapi penulisannya bervariasi, misalnya "
            "\"Belum Bekerja\", \"belum bekerja\", dan \"Belum bekerja\". Dapat "
            "kami seragamkan bila dikehendaki.",
        ],
        [
            "NIK dan nomor BPJS pasien lama",
            "Sebagian besar pasien lama belum memiliki NIK maupun nomor BPJS pada catatan aslinya. "
            "Ini keterbatasan data sumber, bukan kehilangan data saat pemindahan.",
        ],
        [
            "Metode pembayaran catatan lama",
            "Sebagian besar catatan lama tidak mencantumkan metode pembayaran, sehingga dikategorikan "
            "sebagai Tunai. Mohon dikonfirmasi bila ada yang seharusnya Transfer.",
        ],
    ]
    t_temuan = plain_table(temuan_rows, [5.6 * cm, 12.4 * cm], s)
    story.append(t_temuan)
    story.append(Spacer(1, 8))

    story.append(Paragraph("Pemeriksaan Mutu Sistem", s["h2"]))
    uji_rows = [
        ["Pemeriksaan", "Hasil"],
        [
            "Penyelarasan data dijalankan dua kali",
            "<b>Lulus.</b> Jalannya kedua tidak mengubah apa pun, sehingga aman diulang tanpa risiko "
            "data ganda.",
        ],
        ["Pemeriksaan tipe data dan struktur program", "<b>Lulus</b> tanpa kesalahan"],
        ["Proses pembuatan aplikasi versi produksi", "<b>Berhasil</b> diselesaikan tanpa hambatan"],
        [
            "Struktur data baru di basis data",
            "<b>Terpasang</b> di data uji dan sudah diperiksa keberadaannya",
        ],
        [
            "Tampilan tab baru dan tabel laporan",
            "<b>Diperiksa</b> lewat pembuatan aplikasi; pengecekan langsung oleh petugas klinik masih "
            "perlu dilakukan pada saat uji coba",
        ],
    ]
    t_uji = plain_table(uji_rows, [7.2 * cm, 10.8 * cm], s)
    story.append(t_uji)
    story.append(Spacer(1, 6))
    story.append(
        Paragraph(
            "Seluruh penyelarasan di atas baru dilakukan di <b>data uji</b>. Setelah Anda menyatakan hasil "
            "di data uji sudah aman, data yang sama akan kami terapkan ke <b>data produksi</b> dengan "
            "prosedur yang sama, dan Nomor RM pasien yang sudah ada tetap tidak diubah.",
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
    usul_bullets = [
        "<b>Komisi bidan otomatis.</b> Tab Rujukan Bidan saat ini baru untuk pemantauan. Bila klinik "
        "menetapkan besaran tarif komisi resmi untuk kriteria Infus, USG, dan Cek Lab, perhitungan "
        "komisi dapat dibuat otomatis dari data rujukan yang sudah terkumpul.",
        "<b>Pengelolaan data induk oleh klinik.</b> Daftar obat, tarif, dan paket terapi saat ini masih "
        "tersimpan sebagai pengaturan tetap di dalam program. Bila klinik ingin mengubahnya sendiri "
        "tanpa bantuan pengembang, diperlukan layar pengelolaan data induk tersendiri.",
        "<b>Perbaikan nomor RM dari menu Edit Pasien.</b> Saat ini kolom nomor RM dikunci dan tidak "
        "dapat diubah petugas. Bila klinik ingin dapat memperbaiki sendiri nomor yang keliru, perlu "
        "dibuka wewenang khusus beserta pencatatan siapa yang mengubahnya.",
    ]
    for text in usul_bullets:
        story.append(Paragraph(f"&bull;&nbsp; {text}", s["bullet"]))
    story.append(Spacer(1, 4))
    story.append(
        Paragraph(
            "Penambahan di atas berada di luar lingkup pekerjaan saat ini, sehingga perlu diajukan sebagai "
            "pengembangan lanjutan dengan penyesuaian tersendiri. Tidak ada kewajiban mengambilnya sekarang.",
            s["body"],
        )
    )

    # ------------------------------------------------------------ penutup
    story.append(Paragraph("8. Penutup", s["h1"]))
    story.append(
        Paragraph(
            "Seluruh pembaruan pada laporan ini sudah diterapkan dan diuji di data uji, tanpa mengubah "
            "Nomor RM pasien lama. Kami mohon arahan untuk empat hal pada Bagian 5, lalu konfirmasi "
            "setelah Anda memeriksa hasilnya di data uji.",
            s["body"],
        )
    )
    story.append(Spacer(1, 4))

    sign_rows = [
        [
            Paragraph("Diajukan oleh,", s["sign"]),
            Paragraph("Diterima dan disetujui oleh,", s["sign"]),
        ],
        [
            Paragraph("<br/><br/>__________________________<br/>Tim Pengembang Sistem", s["sign"]),
            Paragraph(
                "<br/><br/>__________________________<br/>Pimpinan Klinik Pratama Cikidang Medika",
                s["sign"],
            ),
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
    story.append(KeepTogether([Spacer(1, 4), t_sign]))

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
        title=DOC_RUNNING,
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
        r"d:\Projects\klinik-cikidang-medika\docs\product\Laporan_Pembaruan_Sistem_F009.pdf",
        r"C:\Users\PLN\Downloads\Laporan_Pembaruan_Sistem_F009.pdf",
    ]
    build_report(destinations)
