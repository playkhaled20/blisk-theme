# بليسك · Blisk (Twilight React)

ثيم سلة فاخر لمتاجر التجميل والعناية، مبني على محرّك ثيمات سلة الجديد ([Twilight React](https://docs.salla.dev/twilight/react))
وعلى ثيم سلة الرسمي «رائد رياكت» (`@salla.sa/theme-raed` 1.0.64، رخصة MIT، انظر `THIRD-PARTY-NOTICES`).

`author_email` = fooz1980k@gmail.com · `repository` = github.com/playkhaled20/blisk-theme

## الموجود في هذه النسخة
| الميزة | الملفات |
|---|---|
| النمط السينمائي (`oc_cinema`): إيقافه يرجّع مظهر رائد | `app/components/blisk/BliskDesign.tsx`، `app/styles/04-components/blisk.scss` |
| 11 فئة (يدوي أو تلقائي من اسم المتجر ووصفه)، ولكل فئة لونها المعدني ونص واجهتها | `app/lib/blisk/data.ts`، `app/lib/blisk/index.ts` |
| 18 خلفية (10 داكنة و8 فاتحة)، و5 ألوان معدنية، ومربعا لون التاجر (الخلفية والتمييز) | `app/lib/blisk/index.ts` |
| حبيبات الفيلم (`oc_grain`): طبقة ثابتة بدون حركة | `blisk.scss` |
| الهيرو السينمائي بالمؤشرات (`home.oc-hero`): المؤشرات تظهر بأرقام التاجر فقط | `app/components/home/BliskHero.tsx` |
| البنر الإعلاني (`home.oc-banner`): حتى 12 صورة، مع صورة للجوال | `app/components/home/BliskBanner.tsx` |
| مؤشر ثقة المتجر (`home.oc-trust`): بطاقات التاجر فقط، وبدونها القسم ما يظهر | `app/components/home/BliskTrust.tsx` |

الثيم ما يخترع أي رقم: المؤشرات والحلقات تعرض اللي يكتبه التاجر بس.

## الباقي (المراحل الجاية)
باقي أقسام Twig: العرض السينمائي، والفئات الحية، والأقسام الذكية، وإنفوجرافيك المكوّنات، ولوحة الأرقام، والمقارنة، والمعرض،
وابني روتينك، وجدار الماركات، ورحلتك بعد الشراء، والإطلاق بعدّاد، وأقسام الفئة، والإضافات الذكية الـ12، ولوحة لون العميل.
نسخة Twig موجودة في تاريخ git.

## الأوامر
```bash
pnpm install          # pnpm فقط
salla theme dev       # تشغيل محلي (/ar و /en)
pnpm build
pnpm typecheck
pnpm test
pnpm check:manifest   # بعد أي تعديل على twilight.json
```
