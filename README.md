# COVAN — AI, on your own hardware

**SAVE THE FUTURE 2035** için frontend prototipi.

Covan; kullanıcının kendi GPU'sunu Covan'ın veri merkezinde barındırdığı, **limitsiz** kullandığı ve boşta kalan kapasiteyi kiraya vererek bakımını ödediği bir model. Bu site; ana tanıtım sayfası, **$1.000–$50.000 arası sistem yapılandırıcısı**, **waitlist** akışı ve **CovanOS** arayüz demosunu bir arada gösterir.

> Bu bir prototiptir. Backend yok, ödeme alınmaz; tüm veriler demo amaçlıdır.

## Ne var?

- **Landing:** problem, çözüm, CovanOS, kazanç, güven, SSS.
- **TR / EN:** sağ üstteki `EN` / `TR` düğmesi. Dil tercihi `localStorage` ve `?lang=en` ile korunur.
- **Sistem yapılandırıcısı:** $1.000–$50.000 slider; GPU seviyesi, RAM (64 GB–1 TB) ve depolama (2–32 TB) seçimi. Seçim özeti anlık güncellenir.
- **Waitlist:** “Ön sipariş” yok. Form; ad, e-posta, şehir ve **“Ne kadar ödemeyi düşünürsünüz?”** sorusunu sorar. Ödeme alınmaz.
- **CovanOS demosu:** sohbet ekranı + panel (Genel Bakış, Pazar Yeri, Kazanç, Güven). Mobilde `Panel` / `Sohbet` düğmesiyle erişilir.
- **Kira / kazanç simülasyonu:** %30 / %40 / %50 doluluk; sahip neti ve geri ödeme süresi güncellenir.

## Çalıştırma

Klasörde basit bir statik sunucu aç:

```bash
cd covan-site
python -m http.server 8000
```

Ardından `http://localhost:8000` adresini aç. Alternatif olarak `npx serve .`.

## Vercel’e deploy

1. Bu klasörü bir GitHub reposuna koy (veya repo zaten hazırsa Vercel’e import et).
2. Vercel’de **Add New → Project** → repoyu seç.
3. Framework preset: **Other**. Build command: boş. Output directory: `.` (repo kökü bu klasörse).
4. Deploy.

`vercel.json` hazır; ekstra build gerekmez.

## Özelleştirme

| Ne? | Nerede? |
|---|---|
| Bütçe / GPU / RAM / depolama kademeleri | `app.js` → `CONFIG_TIERS` |
| Türkçe → İngilizce metinler | `i18n.js` → `TR_TO_EN` |
| Renkler, tipografi, boşluklar | `styles.css` → `:root` |
| Sayfa içeriği | `index.html` |
| Favicon | `favicon.svg` |

## Notlar

- `preview/` klasörü sadece yerel görsel kontroller içindir; repoya dahil edilmesi gerekmez.
- Form gönderimi tarayıcıda tutulur; gerçek bir waitlist servisine bağlı değildir.
- CovanOS yanıtları temsilîdir; gerçek model çalıştırmaz.
- Fiyatlar ve pazar rakamları varsayımdır; pilotta doğrulanmalıdır.

---

**Takım Bee** · SAVE THE FUTURE 2035 · 42 İstanbul Girişimcilik Kulübü
