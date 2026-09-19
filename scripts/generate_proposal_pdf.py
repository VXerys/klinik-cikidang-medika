import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, PageBreak, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
import pypdf

pdf_path = r'C:\Users\PLN\Downloads\Proposal_Klinik_Cikidang_Medika.pdf'
image_path = r'd:\Projects\klinik-cikidang-medika\docs\product\assets\dashboard_mockup.png'

doc = SimpleDocTemplate(
    pdf_path,
    pagesize=A4,
    rightMargin=1.5*cm,
    leftMargin=1.5*cm,
    topMargin=1.2*cm,
    bottomMargin=1.2*cm
)

styles = getSampleStyleSheet()

# Strict Professional Typography Styles (Consistent with previous PDF)
title_style = ParagraphStyle(
    'DocTitle',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=13.5,
    leading=17,
    textColor=colors.black,
    alignment=1
)

subtitle_style = ParagraphStyle(
    'DocSubTitle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8.5,
    leading=12,
    textColor=colors.HexColor('#374151'),
    alignment=1
)

meta_style = ParagraphStyle(
    'MetaText',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=7.5,
    leading=10.5,
    textColor=colors.HexColor('#1F2937'),
    alignment=1
)

h1_style = ParagraphStyle(
    'H1',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=9.5,
    leading=12.5,
    textColor=colors.black,
    spaceBefore=5,
    spaceAfter=3
)

body_style = ParagraphStyle(
    'Body',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=7.6,
    leading=10.8,
    textColor=colors.black
)

table_header_style = ParagraphStyle(
    'TH',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=7.4,
    leading=9.5,
    textColor=colors.white,
    alignment=1
)

table_cell_style = ParagraphStyle(
    'TC',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=7.2,
    leading=9.5,
    textColor=colors.black
)

table_cell_bold = ParagraphStyle(
    'TCB',
    parent=table_cell_style,
    fontName='Helvetica-Bold'
)

story = []

# ==================== HALAMAN 1 ====================
story.append(Paragraph('PROPOSAL PENAWARAN SISTEM INFORMASI MANAJEMEN KLINIK', title_style))
story.append(Spacer(1, 1))
story.append(Paragraph('Kerangka Acuan Kerja (KAK) & Spesifikasi Aplikasi Web Klinik Pratama Cikidang Medika', subtitle_style))
story.append(Spacer(1, 2))
story.append(Paragraph('Diajukan Kepada: <b>dr. Ovan / dr. Neneng & Pimpinan Klinik</b> | Tanggal: <b>19 September 2026</b> | Masa Berlaku: <b>7 Hari</b>', meta_style))
story.append(Spacer(1, 2))
story.append(HRFlowable(width='100%', thickness=1.2, color=colors.black, spaceBefore=1, spaceAfter=4))

# 1. Ringkasan Eksekutif
story.append(Paragraph('1. Ringkasan Eksekutif & Pemenuhan 6 Sasaran Utama Klien', h1_style))
story.append(Paragraph(
    'Proposal ini disusun untuk memenuhi kebutuhan Klinik Cikidang Medika dalam mengamankan dan mengelola pencatatan '
    'operasional pasien serta pembukuan kas yang saat ini telah mencapai <b>7.493 transaksi</b> di Google Sheets. '
    'Aplikasi dibangun sebagai <b>Sistem Informasi Web Murni</b> yang dapat diakses fleksibel melalui laptop meja kasir '
    'maupun smartphone dokter di luar klinik tanpa beban biaya langganan bulanan.',
    body_style
))
story.append(Spacer(1, 3))

data_objectives = [
    [Paragraph('Sasaran Utama Klien', table_header_style), Paragraph('Solusi Sistem Informasi Web (Deliverables)', table_header_style)],
    [Paragraph('Data terkumpul terpusat', table_cell_bold), Paragraph('Seluruh arsip kunjungan pasien, riwayat periksa, dan transaksi kasir tersimpan di database online terpusat, mengakhiri risiko data tercecer di spreadsheet manual.', table_cell_style)],
    [Paragraph('Cegah salah penginputan', table_cell_bold), Paragraph('Formulir terstandarisasi dengan menu pilihan (dropdown) untuk nama dokter, diagnosis ICD-10, dan cara bayar. Format angka dan tanggal terisi otomatis.', table_cell_style)],
    [Paragraph('Cegah input ganda (double)', table_cell_bold), Paragraph('Pencarian cerdas berdasarkan Nama atau Nomor Rekam Medis (No RM). Data pasien lama langsung terpanggil tanpa perlu diketik ulang.', table_cell_style)],
    [Paragraph('Akses fleksibel luar klinik', table_cell_bold), Paragraph('Sistem berbasis web online berotentikasi aman; dokter atau pemilik klinik dapat memantau rekapan pemasukan kasir secara langsung dari rumah melalui ponsel.', table_cell_style)],
    [Paragraph('Hemat biaya berkelanjutan', table_cell_bold), Paragraph('Biaya pemeliharaan server adalah <b>Rp 0 / Bulan (Gratis Selamanya)</b> memanfaatkan cloud database berkapasitas besar.', table_cell_style)],
    [Paragraph('Data minimal sesuai alur klinik', table_cell_bold), Paragraph('Fitur difokuskan pada alur kerja nyata klinik (tanpa bridging BPJS yang rumit dan tanpa inventori butir obat apotek yang sudah ditangani RME dokter).', table_cell_style)]
]

t_obj = Table(data_objectives, colWidths=[4.4*cm, 13.6*cm])
t_obj.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.black),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
    ('TOPPADDING', (0,0), (-1,-1), 2.2),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
]))
story.append(t_obj)
story.append(Spacer(1, 5))

# 2. Spesifikasi Fungsional 5 Modul Utama
story.append(Paragraph('2. Spesifikasi Fungsional 5 Modul Utama Sistem', h1_style))
story.append(Paragraph(
    'Alur kerja aplikasi dirancang sangat praktis dan mudah dipelajari oleh seluruh staf non-teknis klinik:',
    body_style
))
story.append(Spacer(1, 2))

data_modules = [
    [Paragraph('Modul & Pengguna', table_header_style), Paragraph('Deskripsi Fitur & Alur Kerja Operasional', table_header_style)],
    [
        Paragraph('<b>A. Pendaftaran & Kasir</b><br/><i>(Petugas Resepsionis)</i>', table_cell_style),
        Paragraph('• <b>Cari Pasien Cepat:</b> Ketik No RM atau Nama, riwayat identitas pasien lama otomatis muncul.<br/>'
                  '• <b>Registrasi Pasien Baru:</b> Form ringkas mencatat Nama, No RM, Tanggal Lahir, Desa, KTP, dan BPJS.<br/>'
                  '• <b>Pencatatan Billing:</b> Pasien BPJS otomatis Rp 0 (masuk klaim kapitasi). Pasien Umum diinput biaya tindakan/obat dan dipilih metode bayar (Tunai / Transfer Bank), serta cetak nota pembayaran.', table_cell_style)
    ],
    [
        Paragraph('<b>B. Rekam Medis Ringkas</b><br/><i>(dr. Ovan & dr. Neneng)</i>', table_cell_style),
        Paragraph('• <b>Antrean Pasien Hari Berjalan:</b> Dokter melihat daftar pasien yang sedang menunggu giliran periksa.<br/>'
                  '• <b>Catatan Hasil Periksa:</b> Dokter mengisi catatan keluhan (anamnesa), memilih diagnosa ICD-10 (contoh: J00 ISPA, K30 Maag, Z34 Kehamilan), dan mencatat resep obat atau tindakan medis yang diberikan.<br/>'
                  '• <b>Riwayat Berobat:</b> Dokter dapat melihat catatan kunjungan pasien sebelumnya untuk memantau perkembangan kesehatan.', table_cell_style)
    ],
    [
        Paragraph('<b>C. Buku Kas Operasional</b><br/><i>(Pengelola Keuangan)</i>', table_cell_style),
        Paragraph('• <b>Pencatatan Kas Masuk:</b> Pencairan dana Kapitasi bulanan BPJS Kesehatan, rujukan USG, atau tes lab.<br/>'
                  '• <b>Pencatatan Kas Keluar:</b> Pembelian obat klinik, bahan medis habis pakai, dan operasional harian (listrik, konsumsi).<br/>'
                  '• <b>Rekap Setor Tunai:</b> Mencatat uang fisik yang disetor kasir ke bank agar pencatatan kas fisik dan bank seimbang.', table_cell_style)
    ],
    [
        Paragraph('<b>D. Dashboard & Ekspor</b><br/><i>(Pemilik / Pimpinan)</i>', table_cell_style),
        Paragraph('• <b>Pantauan Omzet & Pasien:</b> Ringkasan total kunjungan (BPJS vs Umum), omzet umum, dan pengeluaran.<br/>'
                  '• <b>Statistik Penyakit Terbanyak:</b> Grafik 10 penyakit terbesar yang paling sering ditangani klinik.<br/>'
                  '• <b>Tombol Ekspor Excel:</b> Laporan keuangan dan rekapan kunjungan dapat diunduh ke format Excel (.xlsx) dengan 1 kali klik.', table_cell_style)
    ],
    [
        Paragraph('<b>E. Program Khusus Medis</b><br/><i>(dr. Ovan & Tim Medis)</i>', table_cell_style),
        Paragraph('• <b>Kartu Kendali TBC (Tuberkulosis):</b> Pemantauan pengobatan bulanan 6 bulan dengan penanda otomatis pasien mangkir kontrol.<br/>'
                  '• <b>Layanan Sunat (Sirkumsisi):</b> Pencatatan tindakan dan penyimpanan foto luka kontrol pasca sunat (maks. 2 foto kompresi &lt; 300KB di cloud privat aman).<br/>'
                  '• <b>Pasien Pos-Rawat:</b> Agenda pemantauan jadwal kontrol pasien pasca rawat inap/operasi.', table_cell_style)
    ]
]

t_mod = Table(data_modules, colWidths=[4.6*cm, 13.4*cm])
t_mod.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.black),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
    ('TOPPADDING', (0,0), (-1,-1), 2.2),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
]))
story.append(t_mod)

story.append(PageBreak())

# ==================== HALAMAN 2: PRATINJAU DESAIN ====================
story.append(Paragraph('PROPOSAL PENAWARAN SISTEM INFORMASI MANAJEMEN KLINIK (Lanjutan)', title_style))
story.append(Spacer(1, 1))
story.append(Paragraph('Pratinjau Desain Antarmuka Sistem (High-Fidelity UI Prototype)', subtitle_style))
story.append(Spacer(1, 2))
story.append(HRFlowable(width='100%', thickness=1.2, color=colors.black, spaceBefore=1, spaceAfter=4))

story.append(Paragraph('3. Pratinjau Desain Antarmuka Sistem (Dashboard Eksekutif & Finansial)', h1_style))
story.append(Paragraph(
    'Visualisasi di bawah ini merupakan rancangan antarmuka Dashboard Eksekutif yang disiapkan secara khusus menggunakan '
    'data riil historis Klinik Cikidang Medika (<b>7.493 catatan kunjungan dan 4.238 pasien terdaftar</b>). '
    'Desain mengusung konsep higienis medis, kontras tinggi, dan sepenuhnya adaptif untuk laptop kasir maupun ponsel dokter di luar klinik:',
    body_style
))
story.append(Spacer(1, 4))

if os.path.exists(image_path):
    img = Image(image_path, width=17.2*cm, height=16.6*cm)
    story.append(img)
    story.append(Spacer(1, 3))
    caption_style = ParagraphStyle(
        'Caption',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.2,
        leading=9.5,
        textColor=colors.HexColor('#4B5563'),
        alignment=1
    )
    story.append(Paragraph('Gambar 1: Antarmuka Dashboard Eksekutif Klinik Cikidang Medika memuat metrik kunjungan, dana kapitasi BPJS, omzet kasir, 10 diagnosa ICD-10, dan pemantauan kas laci vs bank BRI.', caption_style))
    story.append(Spacer(1, 4))

data_ui_highlights = [
    [Paragraph('Komponen Dashboard', table_header_style), Paragraph('Deskripsi Visual & Data yang Ditampilkan', table_header_style)],
    [Paragraph('4 Kartu Metrik Utama', table_cell_bold), Paragraph('Menampilkan akumulasi <b>7.493 Total Kunjungan</b> (+24% vs 2025), <b>4.238 Pasien Unik</b> dari spreadsheet lama, <b>Rp 28.540.000</b> estimasi kapitasi BPJS bulanan, dan <b>Rp 14.850.000</b> omzet kasir umum.', table_cell_style)],
    [Paragraph('Analitik Penyakit & Wilayah', table_cell_bold), Paragraph('Grafik 10 besar diagnosa ICD-10 terkonfirmasi (ISPA 28%, Gastritis 22%, Hipertensi 18%, ANC 14%, Dermatitis 10%, Diare 8%) dan grafik persentase sebaran desa pasien.', table_cell_style)],
    [Paragraph('Arus Kas Laci vs Bank', table_cell_bold), Paragraph('Saldo kas fisik laci loket (Rp 3.420.000) dan saldo rekening bank BRI (Rp 32.180.000) terpisah rapi dengan log mutasi masuk/keluar serta setor tunai kasir.', table_cell_style)],
    [Paragraph('Aksi Cepat Eksekutif', table_cell_bold), Paragraph('Tombol satu-klik untuk mengunduh seluruh laporan kunjungan dan keuangan ke format Microsoft Excel (.xlsx) kapan saja.', table_cell_style)]
]

t_ui = Table(data_ui_highlights, colWidths=[4.6*cm, 13.4*cm])
t_ui.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.black),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
    ('TOPPADDING', (0,0), (-1,-1), 2.0),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2.0),
]))
story.append(t_ui)

story.append(PageBreak())

# ==================== HALAMAN 3 ====================
story.append(Paragraph('PROPOSAL PENAWARAN SISTEM INFORMASI MANAJEMEN KLINIK (Lanjutan)', title_style))
story.append(Spacer(1, 1))
story.append(Paragraph('Batasan Ruang Lingkup, Nilai Investasi, Jadwal, dan Lembar Pengesahan', subtitle_style))
story.append(Spacer(1, 2))
story.append(HRFlowable(width='100%', thickness=1.2, color=colors.black, spaceBefore=1, spaceAfter=4))

# 4. Batasan Ruang Lingkup
story.append(Paragraph('4. Batasan Ruang Lingkup & Jaminan Penyelamatan Data Historis', h1_style))

data_scope_mig = [
    [Paragraph('Kategori Ruang Lingkup', table_header_style), Paragraph('Keterangan Batasan & Jaminan Teknis', table_header_style)],
    [Paragraph('Layanan Termasuk (In-Scope)', table_cell_bold), Paragraph('Pembangunan 5 modul web, penyimpanan privat foto luka sunat aman, migrasi data lama, instalasi nama domain resmi, sertifikat SSL HTTPS, dan pendampingan awal staf.', table_cell_style)],
    [Paragraph('Layanan Dikecualikan (Out-Scope)', table_cell_bold), Paragraph('Stok penjualan retail skincare (Emerys Glow) ditunda sesuai arahan dokter, bridging API P-Care BPJS, manajemen stok obat apotek per butir (sudah ditangani RME dokter), antrean TV suara, dan rawat inap.', table_cell_style)],
    [Paragraph('Migrasi Data Master Pasien', table_cell_bold), Paragraph('<b>4.238 Pasien Terdaftar</b> dari spreadsheet lama otomatis dipindahkan ke database baru tanpa perlu input ulang.', table_cell_style)],
    [Paragraph('Migrasi Data Kunjungan & Kasir', table_cell_bold), Paragraph('<b>7.493 Riwayat Kunjungan</b> (Agustus 2023 – September 2026) tersambung utuh ke rekam medis dan grafik dashboard.', table_cell_style)],
    [Paragraph('Alamat Domain Resmi Klinik', table_cell_bold), Paragraph('Menggunakan nama domain resmi (contoh: <b>www.klinikcikidangmedika.com</b>). Biaya pembelian domain dibayar langsung oleh pihak klinik (~Rp 150rb–250rb/thn), setting teknis dibantu penuh oleh pengembang.', table_cell_style)]
]

t_sm = Table(data_scope_mig, colWidths=[5.0*cm, 13.0*cm])
t_sm.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.black),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
    ('TOPPADDING', (0,0), (-1,-1), 2.2),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
]))
story.append(t_sm)
story.append(Spacer(1, 5))

# 5. Nilai Investasi & Jadwal Pembayaran
story.append(Paragraph('5. Rincian Nilai Investasi & Jadwal Pembayaran', h1_style))

data_cost = [
    [Paragraph('Pos Investasi / Termin', table_header_style), Paragraph('Nominal Biaya', table_header_style), Paragraph('Ketentuan Pelaksanaan', table_header_style)],
    [Paragraph('Total Biaya Pengembangan Sistem (5 Modul)', table_cell_bold), Paragraph('<b>Rp 2.500.000 (Bersih)</b>', table_cell_style), Paragraph('Biaya pasti (fixed price) mencakup seluruh 5 modul web, modul foto sunat aman, migrasi data, dan garansi.', table_cell_style)],
    [Paragraph('Tahap 1: Uang Muka (DP 50%)', table_cell_bold), Paragraph('<b>Rp 1.250.000</b>', table_cell_style), Paragraph('Dibayarkan saat proposal disetujui untuk memulai pengerjaan teknis.', table_cell_style)],
    [Paragraph('Tahap 2: Pelunasan (50%)', table_cell_bold), Paragraph('<b>Rp 1.250.000</b>', table_cell_style), Paragraph('Dibayarkan setelah sistem selesai diuji coba dan data lama tuntas dimigrasikan.', table_cell_style)],
    [Paragraph('Biaya Pemeliharaan Server Cloud', table_cell_bold), Paragraph('<b>Rp 0 / Bulan (Gratis)</b>', table_cell_style), Paragraph('Bebas biaya tagihan server bulanan seumur hidup.', table_cell_style)],
    [Paragraph('Waktu Pelaksanaan Pengerjaan', table_cell_bold), Paragraph('<b>5 – 7 Hari Kerja</b>', table_cell_style), Paragraph('Terhitung sejak pembayaran uang muka (DP) diterima tim pengembang.', table_cell_style)]
]

t_cost = Table(data_cost, colWidths=[5.0*cm, 4.0*cm, 9.0*cm])
t_cost.setStyle(TableStyle([
    ('BACKGROUND', (0,0), (-1,0), colors.black),
    ('VALIGN', (0,0), (-1,-1), 'TOP'),
    ('GRID', (0,0), (-1,-1), 0.5, colors.black),
    ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F9FAFB')]),
    ('TOPPADDING', (0,0), (-1,-1), 2.2),
    ('BOTTOMPADDING', (0,0), (-1,-1), 2.2),
]))
story.append(t_cost)
story.append(Spacer(1, 5))

# 6. Timeline
story.append(Paragraph('6. Jadwal Tahapan Kerja (Timeline 5 – 7 Hari Kerja)', h1_style))
story.append(Paragraph(
    '• <b>Hari 1:</b> Konfigurasi database cloud, storage bucket foto aman, & migrasi 7.493 data historis dari spreadsheet.<br/>'
    '• <b>Hari 2:</b> Pembangunan antarmuka Modul 1 (Pendaftaran Pasien & Kasir Loket Pembayaran).<br/>'
    '• <b>Hari 3:</b> Pembangunan antarmuka Modul 2 (Rekam Medis Dokter) & Modul 3 (Buku Kas Operasional).<br/>'
    '• <b>Hari 4:</b> Pembangunan antarmuka Modul 5 (Register Program Khusus: TBC 6 Bulan, Layanan Sunat + Unggah Foto, Pos-Rawat).<br/>'
    '• <b>Hari 5:</b> Pembangunan antarmuka Modul 4 (Dashboard Analitik Eksekutif & Fitur Ekspor Excel 1-Klik).<br/>'
    '• <b>Hari 6 – 7:</b> Pengujian menyeluruh sistem, pengujian keamanan foto medis, penyambungan nama domain resmi, serah terima, dan pelatihan singkat staf.',
    body_style
))
story.append(Spacer(1, 6))

# 7. Sign-off
story.append(Paragraph('7. Lembar Persetujuan Kerjasama (Sign-Off & Acceptance)', h1_style))
story.append(Spacer(1, 2))

sign_data = [
    [
        Paragraph('<b>Disetujui Oleh Pihak Klinik:</b><br/><br/><br/><br/><br/>( _____________________________ )<br/>dr. Ovan / dr. Neneng / Pimpinan Klinik', table_cell_style),
        Paragraph('<b>Diajukan Oleh Tim Pengembang:</b><br/><br/><br/><br/><br/>( _____________________________ )<br/>Lead Developer & Engineer Sistem', table_cell_style)
    ]
]

t_sign = Table(sign_data, colWidths=[9.0*cm, 9.0*cm])
t_sign.setStyle(TableStyle([
    ('BOX', (0,0), (-1,-1), 0.5, colors.black),
    ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ('ALIGN', (0,0), (-1,-1), 'CENTER'),
    ('TOPPADDING', (0,0), (-1,-1), 5),
    ('BOTTOMPADDING', (0,0), (-1,-1), 5),
]))
story.append(t_sign)

doc.build(story)

reader = pypdf.PdfReader(pdf_path)
print('PDF generated successfully at:', pdf_path)
print('Total pages:', len(reader.pages))
for i, p in enumerate(reader.pages):
    print(f'Page {i+1} chars:', len(p.extract_text()))
