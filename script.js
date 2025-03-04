// DOM Elementleri
const görevInput = document.getElementById('görev-input');
const görevAçıklama = document.getElementById('görev-açıklama');
const görevTarih = document.getElementById('görev-tarih');
const kategoriSeçim = document.getElementById('kategori-seçim');
const ekleBtn = document.getElementById('ekle-btn');
const görevListesi = document.getElementById('görev-listesi');
const filtreButonları = document.querySelectorAll('.filtre-btn');
const kategoriFiltreSeçim = document.getElementById('kategori-filtre');
const temizleBtn = document.getElementById('temizle-btn');
const toplamGörevSpan = document.getElementById('toplam-görev');
const tamamlananGörevSpan = document.getElementById('tamamlanan-görev');
const temaToggle = document.querySelector('.tema-toggle');

// Modal Elementleri
const düzenleModal = document.getElementById('düzenle-modal');
const düzenleInput = document.getElementById('düzenle-input');
const düzenleAçıklama = document.getElementById('düzenle-açıklama');
const düzenleKategori = document.getElementById('düzenle-kategori');
const düzenleTarih = document.getElementById('düzenle-tarih');
const kaydetBtn = document.getElementById('kaydet-btn');
const kapatBtn = document.querySelector('.kapat');

// Görevleri saklamak için array
let görevler = JSON.parse(localStorage.getItem('görevler')) || [];
let aktifFiltre = 'tümü';
let aktifKategoriFiltre = 'tümü';
let düzenlenenGörevId = null;

// Sayfa yüklendiğinde görevleri göster
document.addEventListener('DOMContentLoaded', () => {
    görevleriGöster();
    istatistikleriGüncelle();
    
    // Tema kontrolü
    if (localStorage.getItem('tema') === 'dark') {
        document.body.classList.add('dark-mode');
        temaToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    // Bugünün tarihini varsayılan olarak ayarla
    const bugün = new Date().toISOString().split('T')[0];
    görevTarih.value = bugün;
});

// Yeni görev ekleme
ekleBtn.addEventListener('click', () => {
    const görevMetni = görevInput.value.trim();
    const açıklama = görevAçıklama.value.trim();
    const kategori = kategoriSeçim.value;
    const tarih = görevTarih.value;
    
    if (görevMetni) {
        const yeniGörev = {
            id: Date.now(),
            metin: görevMetni,
            açıklama: açıklama,
            tamamlandı: false,
            kategori: kategori,
            tarih: tarih,
            oluşturulmaTarihi: new Date().toISOString()
        };
        
        görevler.unshift(yeniGörev);
        localStorage.setItem('görevler', JSON.stringify(görevler));
        
        görevInput.value = '';
        görevAçıklama.value = '';
        
        // Bugünün tarihini tekrar ayarla
        const bugün = new Date().toISOString().split('T')[0];
        görevTarih.value = bugün;
        
        görevleriGöster();
        istatistikleriGüncelle();
    }
});

// Enter tuşu ile görev ekleme
görevInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        ekleBtn.click();
    }
});

// Görevleri görüntüleme
function görevleriGöster() {
    let filtrelenmiş = görevler;
    
    // Durum filtreleme
    if (aktifFiltre === 'tamamlanmış') {
        filtrelenmiş = görevler.filter(görev => görev.tamamlandı);
    } else if (aktifFiltre === 'tamamlanmamış') {
        filtrelenmiş = görevler.filter(görev => !görev.tamamlandı);
    }
    
    // Kategori filtreleme
    if (aktifKategoriFiltre !== 'tümü') {
        filtrelenmiş = filtrelenmiş.filter(görev => görev.kategori === aktifKategoriFiltre);
    }
    
    görevListesi.innerHTML = '';
    
    if (filtrelenmiş.length === 0) {
        görevListesi.innerHTML = `
            <div class="boş-liste">
                <i class="fas fa-clipboard-list"></i>
                <p>Henüz görev bulunmuyor</p>
            </div>
        `;
        return;
    }
    
    filtrelenmiş.forEach(görev => {
        const görevItem = document.createElement('li');
        görevItem.className = `görev-item ${görev.tamamlandı ? 'tamamlandı' : ''}`;
        
        // Kategori rengine göre kenar çizgisi
        görevItem.style.borderLeftColor = getCategoryColor(görev.kategori);
        
        görevItem.innerHTML = `
            <div class="görev-üst">
                <div class="görev-içerik">
                    <input type="checkbox" class="görev-checkbox" ${görev.tamamlandı ? 'checked' : ''}>
                    <div class="görev-detay">
                        <h3 class="görev-başlık">${görev.metin}</h3>
                        ${görev.açıklama ? `<p class="görev-açıklama">${görev.açıklama}</p>` : ''}
                    </div>
                </div>
                <div class="görev-butonlar">
                    <button class="düzenle-btn" title="Düzenle"><i class="fas fa-edit"></i></button>
                    <button class="sil-btn" title="Sil"><i class="fas fa-trash"></i></button>
                </div>
            </div>
            <div class="görev-alt">
                <div class="görev-meta">
                    ${görev.tarih ? `<span class="görev-tarih"><i class="far fa-calendar-alt"></i> ${formatDate(görev.tarih)}</span>` : ''}
                    <span class="kategori-rozet kategori-${görev.kategori}">${görev.kategori}</span>
                </div>
            </div>
        `;
        
        // Checkbox olayı
        const checkbox = görevItem.querySelector('.görev-checkbox');
        checkbox.addEventListener('change', () => {
            görev.tamamlandı = checkbox.checked;
            localStorage.setItem('görevler', JSON.stringify(görevler));
            görevleriGöster();
            istatistikleriGüncelle();
        });
        
        // Düzenleme butonu
        const düzenleBtn = görevItem.querySelector('.düzenle-btn');
        düzenleBtn.addEventListener('click', () => {
            düzenlenenGörevId = görev.id;
            düzenleInput.value = görev.metin;
            düzenleAçıklama.value = görev.açıklama || '';
            düzenleKategori.value = görev.kategori;
            düzenleTarih.value = görev.tarih || '';
            düzenleModal.style.display = 'block';
        });
        
        // Silme butonu
        const silBtn = görevItem.querySelector('.sil-btn');
        silBtn.addEventListener('click', () => {
            if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                görevler = görevler.filter(g => g.id !== görev.id);
                localStorage.setItem('görevler', JSON.stringify(görevler));
                görevleriGöster();
                istatistikleriGüncelle();
            }
        });
        
        görevListesi.appendChild(görevItem);
    });
}

// Kategori rengini al
function getCategoryColor(kategori) {
    switch(kategori) {
        case 'genel': return '#4361ee';
        case 'iş': return '#2a9d8f';
        case 'kişisel': return '#e76f51';
        case 'alışveriş': return '#7209b7';
        default: return '#4361ee';
    }
}

// Tarihi formatla
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

// Filtre butonları
filtreButonları.forEach(btn => {
    btn.addEventListener('click', () => {
        filtreButonları.forEach(b => b.classList.remove('aktif'));
        btn.classList.add('aktif');
        aktifFiltre = btn.getAttribute('data-filtre');
        görevleriGöster();
    });
});

// Kategori filtresi
kategoriFiltreSeçim.addEventListener('change', () => {
    aktifKategoriFiltre = kategoriFiltreSeçim.value;
    görevleriGöster();
});

// Tamamlananları temizle
temizleBtn.addEventListener('click', () => {
    if (confirm('Tamamlanan tüm görevleri silmek istediğinizden emin misiniz?')) {
        görevler = görevler.filter(görev => !görev.tamamlandı);
        localStorage.setItem('görevler', JSON.stringify(görevler));
        görevleriGöster();
        istatistikleriGüncelle();
    }
});

// İstatistikleri güncelle
function istatistikleriGüncelle() {
    toplamGörevSpan.textContent = görevler.length;
    const tamamlananSayısı = görevler.filter(görev => görev.tamamlandı).length;
    tamamlananGörevSpan.textContent = tamamlananSayısı;
}

// Düzenleme modalı işlemleri
kaydetBtn.addEventListener('click', () => {
    const yeniMetin = düzenleInput.value.trim();
    const yeniAçıklama = düzenleAçıklama.value.trim();
    const yeniKategori = düzenleKategori.value;
    const yeniTarih = düzenleTarih.value;
    
    if (yeniMetin && düzenlenenGörevId) {
        görevler = görevler.map(görev => {
            if (görev.id === düzenlenenGörevId) {
                return { ...görev, metin: yeniMetin, açıklama: yeniAçıklama, kategori: yeniKategori, tarih: yeniTarih };
            }
            return görev;
        });
        
        localStorage.setItem('görevler', JSON.stringify(görevler));
        düzenleModal.style.display = 'none';
        görevleriGöster();
    }
});

kapatBtn.addEventListener('click', () => {
    düzenleModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === düzenleModal) {
        düzenleModal.style.display = 'none';
    }
});

// Tema değiştirme
temaToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('tema', 'dark');
        temaToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        localStorage.setItem('tema', 'light');
        temaToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
});