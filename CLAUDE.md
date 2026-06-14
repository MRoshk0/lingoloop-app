# LingoLoop App — Project Context

## Опис
Кросплатформний frontend для LingoLoop (Ionic + Angular + Capacitor).
Web/PWA, iOS, Android з одного codebase.
Мета: реальний робочий додаток для щоденного вивчення німецької,
потенційний релиз в App Store.

## Стек
Ionic + Angular, Capacitor.
Пізніше: NgRx, Web Speech API.

## Related repo
Backend API: lingoloop-api (окремий репозиторій)

## Поточний стан
Фаза: Foundation ✓
- Project scaffolded: Ionic + Angular 20, Capacitor
- ESLint (flat config) + Prettier налаштовано
- Folder structure: core/, shared/, features/
- Standalone components + routing в app.routes.ts
- Build успішний
Наступний крок: Add Card форма (SM-1)

## Конвенції
- Conventional commits (feat:, fix:, docs:, chore:)
- Feature docs: /docs/features/<name>.md

## Відомі рішення
- Пріоритет: Add Card -> Review (SM-2) -> Polish/PWA -> AI/Voice -> iOS/App Store
- Hosting: Vercel (web/PWA), Capacitor для iOS/Android пізніше
- Angular version (20.3.25) вибрана Ionic CLI автоматично для сумісності з @ionic/angular
- ESLint: flat config (eslint.config.js), Prettier на 100 chars
- State management: Angular signals + сервіси в core/services (NgRx буде пізніше)
