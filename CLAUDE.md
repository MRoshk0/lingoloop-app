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
Фаза: Core UX ✓

### Завершено
- Project scaffolded: Ionic + Angular 20, Capacitor
- ESLint (flat config) + Prettier налаштовано
- Bottom nav (ion-tabs): Cards / Review / Dictionary / Profile
- Cards landing → My Cards (CRUD card sets + cards) + Predefined Sets (deck detail)
- Review session: idle → reviewing (click-to-flip, progress bar) → complete (summary)
- Dictionary: 12k German nouns (CC BY-SA 4.0), prefix search, expandable inline translation (MyMemory API)
- Third-party notices: THIRD_PARTY_NOTICES.md покриває всі джерела
- Feature docs: docs/features/word-dictionary.md, docs/features/review-session-ux.md

### Наступний крок: SM-1 Add Card форма (інтеграція з CardsService)

## Конвенції
- Conventional commits (feat:, fix:, docs:, chore:)
- Feature docs: /docs/features/<name>.md

## Відомі рішення
- Пріоритет: Add Card -> Review (SM-2) -> Polish/PWA -> AI/Voice -> iOS/App Store
- Hosting: Vercel (web/PWA), Capacitor для iOS/Android пізніше
- Angular version (20.3.25) вибрана Ionic CLI автоматично для сумісності з @ionic/angular
- ESLint: flat config (eslint.config.js), Prettier на 100 chars
- State management: Angular signals + сервіси в core/services (NgRx буде пізніше)

## Design System (Figma)
- Font: Nunito (400/500/600/700), підключено через Google Fonts в index.html
- Primary: #FFC93C (жовтий), contrast: #3D2E00
- Secondary: #4CAF93 (зелений)
- Background: #FFFBEF, text: #3D2E00, surface: #F5E6C8
- Border radius: 16px (--app-border-radius) — застосовано глобально до button/card/item/input
- Змінні в src/theme/variables.scss, глобальні правила в src/global.scss
