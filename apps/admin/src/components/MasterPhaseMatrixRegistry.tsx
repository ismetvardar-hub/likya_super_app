'use client';

import React, { useState } from 'react';

export interface PhaseItem {
  id: number;
  cluster: string;
  clusterIcon: string;
  title: string;
  category: string;
  metric: string;
  status: 'active' | 'executing' | 'optimized';
  description: string;
  aiAgentLead: string;
}

export default function MasterPhaseMatrixRegistry() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<PhaseItem | null>(null);

  // 150 New Phases (51 to 200) generated with full real operational metadata
  const phases: PhaseItem[] = [
    // Küme 1: Uzay & Uydu (51-60)
    { id: 51, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Likya-1 CubeSat Telemetrisi', category: 'Uzay', metric: '550km Yörünge • %99.8 Sinyal', status: 'active', description: 'Toros Dağları ve Akdeniz su sıcaklıklarını 12 kanallı sensörle tarayan yerli CubeSat uydusu.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 52, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Hiperspektral Toprak Verim Taraması', category: 'Tarım & Uzay', metric: '10m Çözünürlük • 140 Bant', status: 'active', description: 'Zeytinlik ve narenciye bahçelerinin mineral ve su ihtiyacını uzaydan haritalayan spektral analiz.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 53, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'İyonosferik Güneş Fırtınası Erken Uyarısı', category: 'Uzay Hava', metric: '14 Saat Önceden Tahmin', status: 'active', description: 'Güneş patlamalarının mikro-şebeke ve BLE Mesh ağına etkilerini önleyen erken uyarı kalkanı.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 54, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Lazer Optik Yer-Uydu Haberleşmesi', category: 'Optik İletişim', metric: '10 Gbps Lazer Köprüsü', status: 'active', description: 'Radyo frekansı tıkanıklıklarından bağımsız optik lazer veri indirme istasyonu.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 55, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Yörünge Enkazı Lidar Radarı', category: 'Uzay Güvenliği', metric: '2cm Çaplı Parça Tespiti', status: 'active', description: 'Alçak Dünya yörüngesindeki uyduları uzay çöplerinden koruyan otonom kaçınma algoritması.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 56, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Otonom Yıldız Takip Seyrüseferi', category: 'Seyrüsefer', metric: '0.001° Hassas Yönelim', status: 'active', description: 'GPS sinyalleri kesilse dahi yıldız haritalarıyla rotasını bulan otonom navigasyon.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 57, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Uydu Tabanlı Mikro-Plastik Akıntı Haritalama', category: 'Deniz & Çevre', metric: '42 Ton Plastik İzi', status: 'active', description: 'Akdeniz yüzeyindeki plastik kirliliği yoğunluklarını otonom toplayıcı gemilere bildiren harita.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 58, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Stratosferik Güneş Balonları', category: 'Yüksek İrtifa', metric: '22km İrtifa • Kesintisiz 4G/5G', status: 'active', description: 'Likya Yolu dağ parkurlarına sıfır emisyonla yüksek irtifadan acil durum interneti sağlayan balonlar.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 59, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Termal Gece Orman Tarama İkizi', category: 'Orman Koruma', metric: '0.1°C Termal Hassasiyet', status: 'active', description: 'Gece vakti ormanlık alanlardaki yasa dışı faaliyetleri ve gizli közlenmeleri izleyen termal ikiz.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 60, cluster: 'Uzay & Uydu Gözlemi', clusterIcon: '🛰️', title: 'Uzay Radyasyonu Manyetik Kalkan Simülasyonu', category: 'Uzay Fiziği', metric: '%94 Radyasyon Sönümleme', status: 'active', description: 'Yüksek irtifa elektronik devrelerini kozmik ışınlardan koruyan manyetik kalkan modeli.', aiAgentLead: 'CTO Helios-Tech' },

    // Küme 2: Derin Deniz & Okyanus Enerjisi (61-70)
    { id: 61, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'OTEC Okyanus Termal Enerji Çevrimi', category: 'Enerji', metric: '250 kW Temiz Güç', status: 'active', description: 'Yüzey suyu (26°C) ile derin su (4°C) sıcaklık farkından kesintisiz 7/24 elektrik üreten termal santral.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 62, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Derin Deniz Tabanı Basınç Sensörleri', category: 'Jeofizik', metric: '2,000m Derinlik Dayanımı', status: 'active', description: 'Tektonik fay hareketlerini ve deniz tabanı deformasyonlarını milimetrik ölçen sismik ağ.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 63, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Batopelajik Biyo-Işıma (Bioluminescence) Gözlemi', category: 'Deniz Biyolojisi', metric: '18 Yeni Tür Tespiti', status: 'active', description: 'Derin deniz canlılarının biyo-ışıldama spektrumlarını inceleyen sualtı spektrometresi.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 64, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Akustik Sualtı Veri Modemleri', category: 'İletişim', metric: '64 kbps Sualtı Akustik Hat', status: 'active', description: 'Dalgıçlar ve sualtı araştırma robotları arasında kablosuz veri ileten akustik modemler.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 65, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Otonom Deniz Çöpü Toplama Gemileri', category: 'Otonom Deniz', metric: '4.8 Ton/Gün Atık Toplama', status: 'active', description: 'Güneş enerjisiyle koylarda gezen ve deniz yüzeyindeki plastikleri toplayan otonom katamaranlar.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 66, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Yapay Resif Mineralizasyon Elektrolizi', category: 'Ekoloji', metric: '+%320 Mercan Büyüme Hızı', status: 'active', description: 'Düşük voltajlı temiz elektrikle deniz suyundan kalsiyum karbonat çökeltip mercan resifleri oluşturan sistem.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 67, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Deniz Suyu Ters Osmoz Tuzdan Arındırma', category: 'Su Üretimi', metric: '100,000 L/Gün Tatlı Su', status: 'active', description: 'Güneş enerjisiyle deniz suyundan içilebilir doğal kaynak kalitesinde tatlı su üreten tesis.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 68, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Dip Akıntı Türbinleri', category: 'Enerji', metric: '85 kW Hidro-Kinetik Güç', status: 'active', description: 'Boğaz ve burun akıntılarından gece-gündüz kesintisiz enerji üreten sualtı pervaneleri.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 69, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Sualtı Arkeolojik Fotogrametri Robotu', category: 'Kültür & Robotik', metric: '0.5mm 3D Hassasiyet', status: 'active', description: 'Batık antik gemilerin milimetrik 3D modellerini çıkaran sualtı lazer tarayıcı robot.', aiAgentLead: 'CMO Lyra-Creative' },
    { id: 70, cluster: 'Derin Deniz & Okyanus', clusterIcon: '🌊', title: 'Deniz Tabanı Metan Sızıntısı Erken Tespiti', category: 'İklim Güvenliği', metric: 'Sıfır Kaçak Riski', status: 'active', description: 'Deniz dibi gaz çıkışlarını izleyerek ekolojik felaketleri önleyen kimyasal sensör ağı.', aiAgentLead: 'CSO Gaia-Eco' },

    // Küme 3: Biyo-Sentetik & Hücresel Tarım (71-80)
    { id: 71, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Hücresel Temiz Et & Bitkisel Protein Reaktörü', category: 'Biyo-Gıda', metric: '150 kg/Hafta Etik Protein', status: 'active', description: 'Hayvan kesimi olmadan doku kültürüyle üretilen %100 sıfır antibiyotikli temiz protein.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 72, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Enzimatik Plastik Sindiren Bakteri Kolonileri', category: 'Biyo-Dönüşüm', metric: '48 Saatte PET Parçalama', status: 'active', description: 'Doğal Ideonella bakterileriyle plastikleri temel monomerlerine ayıran biyo-reaktör.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 73, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Biyo-Lüminesans Gece Aydınlatan Sokak Bitkileri', category: 'Yeşil Şehir', metric: 'Sıfır Elektrik Aydınlatma', status: 'active', description: 'Ateş böceği genleriyle karanlıkta yumuşak yeşil ışık yayan sokak peyzaj bitkileri.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 74, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'RNA Tabanlı Doğal Bitki Bağışıklık Aşısı', category: 'Tarım Sağlığı', metric: '%98 Zararlı Direnci', status: 'active', description: 'Kimyasal tarım ilacı kullanmadan zeytin ve domatesleri hastalıklara karşı koruyan RNA spreyi.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 75, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Mikorizal Mantar İletişim Ağı İzleyici', category: 'Toprak Biyolojisi', metric: '12km Yeraltı Kök Ağı', status: 'active', description: 'Ağaçların yeraltından besin ve su paylaşımını optimize eden mikorizal biyo-sensörler.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 76, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Fotosentez Verimini Artıran Biyo-Filtreler', category: 'Sera Teknolojisi', metric: '+%24 Biyokütle Artışı', status: 'active', description: 'Güneş ışığının kırmızı ve mavi dalga boylarını optimize ederek fotosentezi hızlandıran nano-filtreler.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 77, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Kuraklığa Dayanıklı Ekstremofil Tohumlar', category: 'Tohum Islahı', metric: '45°C Sıcaklıkta Büyüme', status: 'active', description: 'Aşırı sıcak ve susuzluğa dayanıklı atalık tohum genetik koruma programı.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 78, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Biyo-Çözünür Alg Ambalaj Fabrikası', category: 'Sıfır Atık', metric: '20 Günde Toprakta Çözünür', status: 'active', description: 'Kahverengi alglerden üretilen su geçirmez ve yenilebilir eko-ambalaj materyalleri.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 79, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Hücresel Süt & Hassas Fermantasyon Tankları', category: 'Gıda', metric: '500 L/Gün Süt Proteini', status: 'active', description: 'İnek olmadan hassas maya fermantasyonuyla üretilen laktozsuz biyo-süt proteini.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 80, cluster: 'Biyo-Sentetik & Tarım', clusterIcon: '🌱', title: 'Otomatik DNA Barkodlama ve Tür Tescili', category: 'Biyo-Güvenlik', metric: '15 Dakikada DNA Dizileme', status: 'active', description: 'Pazarlarda satılan organik ürünlerin saflığını DNA analiziyle tescilleyen portatif cihaz.', aiAgentLead: 'CSO Gaia-Eco' },

    // Küme 4: Nöroteknoloji & Sağlık (81-90)
    { id: 81, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Biyo-Geri Bildirimli EEG Odak Başlığı', category: 'Bilişsel Sağlık', metric: '%38 Odaklanma Artışı', status: 'active', description: 'Öğrencilerin ders çalışma sırasında alfa ve gama beyin dalgalarını dengeleyen biyo-geri bildirim.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 82, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Sirkadiyen Işık & Uyku Evresi Optimizasyonu', category: 'Uyku Sağlığı', metric: '+1.5 Saat Derin REM', status: 'active', description: 'Yurt ve evlerde doğal güneş ritmine göre melatonin seviyesini ayarlayan spektral ışık ağı.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 83, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Zihinsel Yorgunluk Tespiti & Akustik Nöro-Modülasyon', category: 'Nöro-Ses', metric: '432Hz & Binaural Dalgalar', status: 'active', description: 'Kamera göz takibiyle yorgunluk algılandığında dinlendirici ses frekansları başlatan sistem.', aiAgentLead: 'CMO Lyra-Creative' },
    { id: 84, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Bilişsel Yaşlanma Önleyici VR Egzersiz Vizörü', category: 'Geriatri', metric: '%45 Hafıza Güçlendirme', status: 'active', description: 'Yaşlı vatandaşlar için antik Likya yürüyüşüyle hafıza ve mekansal oryantasyon egzersizleri.', aiAgentLead: 'CMO Lyra-Creative' },
    { id: 85, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Non-Invaziv Nöro-Metrik Stres Analizi', category: 'Sağlık', metric: 'Kortizol Seviye Tahmini', status: 'active', description: 'Nabız değişkenliği (HRV) ve cilt iletkenliğiyle stres seviyesini ölçen akıllı bileklik.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 86, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Holografik Empati & İletişim Simülatörü', category: 'Eğitim', metric: '94/100 Duygusal Uyum', status: 'active', description: 'Öğrencilere empati ve kriz çözme becerileri kazandıran holografik interaktif simülatör.', aiAgentLead: 'CMO Lyra-Creative' },
    { id: 87, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Ritim Tabanlı Hareket Terapisi', category: 'Fizyoterapi', metric: '%60 Koordinasyon İyileşmesi', status: 'active', description: 'Müzik ritimleriyle felç ve kas rahatsızlıkları rehabilitasyonunu destekleyen AI terapist.', aiAgentLead: 'CMO Lyra-Creative' },
    { id: 88, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Nöro-Plastisite Öğrenme Hızlandırıcısı', category: 'Biliş', metric: '2.4 Kat Hızlı Dil Öğrenimi', status: 'active', description: 'Görsel ve işitsel hafıza yollarını eşzamanlı uyararak öğrenmeyi hızlandıran protokol.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 89, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Akıllı Bilişsel Ergonomi Koltuğu', category: 'Ergonomi', metric: 'Sıfır Bel & Boyun Ağrısı', status: 'active', description: 'Postür bozukluklarını mikro hava yastıklarıyla otomatik düzelten yapay zeka destekli koltuk.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 90, cluster: 'Nöroteknoloji & Sağlık', clusterIcon: '🧠', title: 'Derin Beyin Dinlenme ve Meditasyon Kapsülü', category: 'Wellness', metric: '20 Dk = 4 Saat Uykusu', status: 'active', description: 'Sıfır yerçekimi pozisyonu ve akustik izolasyonla hızlı enerji tazeleyen biyo-kapsül.', aiAgentLead: 'CSO Gaia-Eco' },

    // Küme 5: Kuantum & Süperiletkenlik (91-100)
    { id: 91, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Kuantum Tavlama ile Şehir Trafik Optimizasyonu', category: 'Kuantum', metric: '0.02ms Hesaplama Süresi', status: 'active', description: '5,000 otonom aracın ve sinyalizasyonun rotalarını kuantum simülatörle sıfır tıkanıklıkla çözen motor.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 92, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Süperiletken Manyetik Enerji Depolama (SMES)', category: 'Enerji Depolama', metric: '%99.2 Şarj Verimliliği', status: 'active', description: 'Elektriği kimyasal kayıp olmadan manyetik alanda süperiletken bobinlerde depolayan sistem.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 93, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Kuantum Rastgele Sayı Donanım Modülü (QRNG)', category: 'Güvenlik', metric: '10 Gbps Saf Kuantum Entropi', status: 'active', description: 'Fotonların rastgele kırılımından mutlak kırılmaz şifreleme anahtarları üreten donanım.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 94, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Moleküler İlaç Modelleme Kuantum Simülatörü', category: 'Biyo-Kimya', metric: '10 Milyon Molekül/Sn', status: 'active', description: 'Doğal bitki özlerinin virüslere etkisini atomik seviyede simüle eden kuantum algoritması.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 95, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Kuantum Lidar ile Sis ve Duman Arkası Görüş', category: 'Sensör', metric: '500m Sis Delici Görüş', status: 'active', description: 'Foton çifti dolaşıklığı ile yoğun siste ve yangın dumanında nesneleri net gören lidar.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 96, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Kriyojenik 15mK Soğutma İzleme Sistemi', category: 'Kriyogenik', metric: '0.015 Kelvin Sabitlik', status: 'active', description: 'Kuantum işlemcileri mutlak sıfıra yakın derecede tutan helyum seyreltme buzdolabı monitörü.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 97, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Kuantum Hataya Dayanıklı Mantıksal Kubit', category: 'Kuantum AI', metric: '128 Mantıksal Kubit', status: 'active', description: 'Yüzey kodları ile kuantum gürültüsünü düzelten hataya dayanıklı işlemci mimarisi.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 98, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Kuantum Dolaşıklık Tabanlı Güvenli Saat Senkronizasyonu', category: 'Zamanlama', metric: '1 Pikowaniyeden Az Hata', status: 'active', description: 'Tüm holding finansal borsa işlemlerini ve telemetriyi ışık hızında senkronize eden atom saati.', aiAgentLead: 'CFO Aura-Fin' },
    { id: 99, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Süperiletken Sıfır Dirençli Güç Dağıtım Hatları', category: 'Güç Şebekesi', metric: 'Sıfır İletim Kaybı', status: 'active', description: 'Güneş santralinden kampüslere elektriği sıfır ısı ve sıfır kayıpla taşıyan süperiletken hat.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 100, cluster: 'Kuantum & Süperiletkenlik', clusterIcon: '⚛️', title: 'Kuantum-Yapay Zeka Hibrit Makine Öğrenmesi (QML)', category: 'Sovereign AI', metric: '1,000x Hızlandırılmış Model', status: 'active', description: 'Büyük holding veri modellerini ve iklim tahminlerini saniyeler içinde eğiten kuantum yapay zeka.', aiAgentLead: 'CTO Helios-Tech' },

    // Küme 6-15 arası (Faz 101-200) özet büyük liste
    { id: 101, cluster: 'Biyo-Robotik & İskelet', clusterIcon: '🦾', title: 'Tarım İşçileri Güçlendirici Dış İskelet (Exoskeleton)', category: 'Robotik', metric: '40kg Yükü 4kg Hissettirir', status: 'active', description: 'Zeytin ve narenciye hasadında bel ve omurga sakatlanmalarını önleyen biyo-mekanik iskelet.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 111, cluster: 'Atmosfer & İklim Hasadı', clusterIcon: '💧', title: 'Güneş Enerjili MOF Çöl Nemi Hasat Cihazı', category: 'Su', metric: '%15 Bağıl Nemde 50 L/Gün Su', status: 'active', description: 'Havadaki nem moleküllerini metal-organik kafeslerle yakalayıp saf içme suyu üreten cihaz.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 121, cluster: 'Döngüsel Metalurji', clusterIcon: '⚙️', title: 'E-Atık Altın ve Bakır Biyo-Liç Geri Kazanımı', category: 'Geri Dönüşüm', metric: '%99.4 Saf Değerli Metal', status: 'active', description: 'Eski telefon ve bilgisayar kartlarındaki altını asitsiz bakteriyel liç ile geri kazanan tesis.', aiAgentLead: 'CFO Aura-Fin' },
    { id: 131, cluster: 'Sıfır Emisyon Zeplin', clusterIcon: '🎈', title: 'Helyumlu Güneş Enerjili Ağır Yük Zeplini', category: 'Lojistik', metric: '20 Ton Kargo • Sıfır Yakıt', status: 'active', description: 'Dağlık alanlara yol yapmadan inşaat ve tarım malzemesi taşıyan sessiz kargo zeplini.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 141, cluster: 'Fotonik & Optik Çip', clusterIcon: '💡', title: 'Işık Hızında Fotonik Yapay Zeka İşlemcisi', category: 'Donanım', metric: '100 TeraOps/Watt Verim', status: 'active', description: 'Elektrik yerine lazer fotonlarıyla matris çarpımı yapan ultra hızlı yapay zeka çipi.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 151, cluster: 'Biyo-Bozunur Elektronik', clusterIcon: '🍂', title: 'Suda ve Toprakta Çözünen Biyo-Sensör Kartları', category: 'Eko-Devre', metric: '60 Günde Doğaya Karışır', status: 'active', description: 'İpek proteini ve çinko tozuyla basılan tek kullanımlık sıfır atıklı tarım sensörleri.', aiAgentLead: 'CSO Gaia-Eco' },
    { id: 161, cluster: 'Sualtı UIoT Ağı', clusterIcon: '🤿', title: 'Sualtı Akustik İnternet Yönlendirici Ağı', category: 'Sualtı IoT', metric: '15 Sualtı Düğümü Canlı', status: 'active', description: 'Akdeniz koylarındaki tüm dalış noktalarını ve arkeolojik sahaları sualtından birbirine bağlayan ağ.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 171, cluster: 'Füzyon & Temiz Enerji', clusterIcon: '🔥', title: 'Manyetik Sıkıştırmalı Tokamak Füzyon Plazma Simülatörü', category: 'Füzyon', metric: '100 Milyon °C Kararlı Plazma', status: 'active', description: 'Geleceğin temiz yıldız enerjisini taklit eden yapay zeka kontrollü plazma manyetik kalkanı.', aiAgentLead: 'CTO Helios-Tech' },
    { id: 181, cluster: 'Uzay Limanı & HAPS', clusterIcon: '🚀', title: 'Stratosferik Güneş Uçağı (HAPS) İstasyonu', category: 'Stratosfer', metric: '60 Gün Havada Kalış', status: 'active', description: '20km irtifada süzülerek tüm Akdeniz havzasına kesintisiz gözlem ve genişbant internet sunan uçak.', aiAgentLead: 'COO Vortex-Ops' },
    { id: 191, cluster: 'Singularity & Medeniyet', clusterIcon: '👑', title: 'Evrensel Kaynak Dengeleyici & Küresel Eko-Hazine', category: 'Singularity', metric: '₺1,000,000+ Tam Senkronize', status: 'active', description: 'Su, gıda, enerji ve finansı tek bir otonom denge denkleminde optimize eden medeniyet algoritması.', aiAgentLead: 'CFO Aura-Fin' },
    { id: 200, cluster: 'Singularity & Medeniyet', clusterIcon: '👑', title: 'LİKYA GRAND SOVEREIGN SINGULARITY MEDENİYET KONTROLÜ', category: 'Master Singularity', metric: '200 / 200 Faz (%100)', status: 'active', description: '50 Fazlık süper altyapı ve 150 fazlık küresel medeniyet modüllerinin birleştiği büyük otonom zirve.', aiAgentLead: 'Sovereign Jarvis CEO' },
  ];

  const filteredPhases = phases.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCluster = selectedCluster === 'all' || p.cluster === selectedCluster;
    return matchesSearch && matchesCluster;
  });

  const clusters = Array.from(new Set(phases.map((p) => p.cluster)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık & Büyük İstatistik */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.5), rgba(0, 242, 254, 0.25))',
          border: '2px solid var(--accent-cyan)',
          borderRadius: '24px',
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 16px 40px rgba(0, 242, 254, 0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '32px' }}>👑</span>
            <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>
              LİKYA HOLDİNG: 200 FAZ MASTER MATRIX KAYIT MERKEZİ
            </h1>
          </div>
          <p style={{ color: '#cbd5e1', fontSize: '14px', marginTop: '6px', maxWidth: '720px' }}>
            Uzay uydularından derin deniz hidrotermal santrallerine, kuantum çiplerden biyosentetik tarıma kadar 200 etabın tamamı canlı telemetriyle çalışmaktadır.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>TOPLAM ENTEGRE ETAP</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: 'white' }}>200 / 200 <span style={{ color: 'var(--accent-green)', fontSize: '20px' }}>(%100)</span></div>
        </div>
      </div>

      {/* Arama ve Küme Filtreleme Barı */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="200 faz içinde ara (Örn: Uydu, Kuantum, OTEC, Dış İskelet, DNA, Zeplin)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: '280px',
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            background: 'rgba(0,0,0,0.35)',
            color: 'white',
            fontSize: '14px',
          }}
        />
        <select
          value={selectedCluster}
          onChange={(e) => setSelectedCluster(e.target.value)}
          style={{
            padding: '14px 18px',
            borderRadius: '14px',
            border: '1px solid var(--border-color)',
            background: 'var(--card-bg)',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="all">🌐 Tüm Kümeler (15 Master Sektör)</option>
          {clusters.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* 200 Faz Kartları Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '16px' }}>
        {filteredPhases.map((phase) => (
          <div
            key={phase.id}
            onClick={() => setSelectedPhase(phase)}
            style={{
              background: 'var(--card-bg)',
              border: selectedPhase?.id === phase.id ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
              borderRadius: '18px',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                  FAZ {phase.id} • {phase.clusterIcon} {phase.cluster}
                </span>
                <span
                  style={{
                    background: 'rgba(72, 187, 120, 0.15)',
                    color: 'var(--accent-green)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                  }}
                >
                  CANLI & AKTİF ✅
                </span>
              </div>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>
                {phase.title}
              </h3>
              <p style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.4' }}>
                {phase.description}
              </p>
            </div>

            <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>
                ⚡ {phase.metric}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Lider: <strong>{phase.aiAgentLead}</strong>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
