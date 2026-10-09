# One on One FinApp 💚

### Shared finances, clearer decisions.

**One on One FinApp** is a personal finance and shared expenses web application developed as an independent project with the support of AI-powered development tools.

The project explores how to manage shared expenses in a flexible and transparent way, adapting to different financial situations and expense-splitting methods.

Beyond product development, this project focuses on **software quality, test case design, and test automation**.

> **Disclaimer:** This is a portfolio and learning project. It is not a banking application and does not handle real money.

---

## 🎯 Project Goals

- Develop a personal finance and shared expenses application.
- Define clear business rules for splitting expenses.
- Identify risks and edge cases from a QA perspective.
- Validate financial calculations and data consistency.
- Design and execute unit, component, and end-to-end tests.
- Explore automated testing within a CI/CD workflow.
- Use AI tools to support development while critically reviewing generated code.

## ✨ Features

### 📊 Financial Dashboard

- Overview of financial activity.
- Income and expense visualization.
- Expense distribution by category.
- Savings goals tracking.
- Personal and shared expense summaries, where implemented.

### 💸 Expense Management

- Create, view, edit, and delete expenses.
- Categorize financial transactions.
- Distinguish personal and shared expenses.
- Validate input data.
- Update financial indicators after changes.

### 🤝 Shared Expenses

The application explores three expense-splitting methods:

- **Equal split (50/50):** expenses are divided equally between participants.
- **Income-based split:** contributions are calculated proportionally to each participant's income.
- **Custom split:** expenses are distributed according to predefined percentages or amounts.

The goal is to verify that calculations, settlements, and balances remain consistent when transactions are created, edited, or deleted.

### 🎯 Savings Goals

- Create and track savings goals.
- Record contributions.
- Monitor progress towards each goal.

*Feature availability and behavior must be verified against the current implementation.*

---

## 🧪 Quality Assurance & Software Testing

QA is a core part of this project. The testing strategy focuses on validating both the user interface and the underlying business logic.

### Unit and Component Testing

**Tools:** Vitest, React Testing Library, and Jest DOM.

The project includes testing configuration and test files intended to validate:

- Monetary calculations and rounding.
- Expense-splitting rules.
- Settlements between participants.
- React component behavior.
- Input validation.

### End-to-End Testing (E2E)

**Tools:** Python, Pytest, and Playwright.

The E2E test suite covers scenarios involving:

- Application loading.
- Expense creation and deletion.
- Shared expense management.
- Form validation.
- Data persistence after reloading the application.
- Savings goals.
- Navigation and responsive behavior.

The actual execution status and coverage of these tests must be confirmed through local test runs.

### 🔍 Example Test Scenarios

| Test ID | Scenario | Expected Result |
|---|---|---|
| TC-01 | Split a €100 expense equally | Each participant is assigned €50. |
| TC-02 | Split a €100 expense using a 40/60 ratio | Contributions are €40 and €60. |
| TC-03 | Enter percentages that do not total 100% | The application rejects the invalid split. |
| TC-04 | Edit a shared expense | The balance is recalculated correctly, without duplicate accounting. |
| TC-05 | Delete a transaction | Financial indicators and balances reflect the deletion. |
| TC-06 | Reload the application | Data persists according to the implemented storage mechanism. |
| TC-07 | Submit invalid amounts or form data | Appropriate validation messages are displayed. |
| TC-08 | Process monetary amounts with cents | Calculations follow the defined rounding policy. |

These are expected outcomes, not a claim that every scenario has already been executed or passed.

---

## 🛠️ Tech Stack

### Development

- React
- JavaScript
- Vite
- CSS

### Testing & Automation

- Vitest
- React Testing Library
- Jest DOM
- Python
- Pytest
- Playwright

### Development Tools

- **Antigravity:** AI-assisted development.
- **Visual Studio Code:** Code review, execution, and debugging.
- **Git & GitHub:** Version control and project documentation.

### CI/CD

The next automation goal is to integrate automated tests and production builds into **GitHub Actions**.

CI integration is considered pending until a workflow has been configured and its execution verified.

---

## 🚀 Getting Started

### Prerequisites

- Node.js and npm.
- Python and pip for E2E testing.
- Chromium installed for Playwright.

### 1. Clone the Repository

```bash
git clone https://github.com/lmes4/OneonOneFinapp.git
cd OneonOneFinapp
```

### 2. Install JavaScript Dependencies

```bash
npm ci
```

### 3. Run the Development Server

```bash
npm run dev
```

Vite will display the local URL in the terminal. By default, it is usually:

`http://localhost:5173/`

### 4. Run Unit and Component Tests

```bash
npm test
```

To run tests in watch mode:

```bash
npm run test:watch
```

### 5. Run E2E Tests

Install the Python dependencies required by the project and Playwright if they are not already available.

```bash
python -m pip install pytest playwright
python -m playwright install chromium
```

Start the application in one terminal:

```bash
npm run dev
```

Then, in a second terminal, run the E2E suite from the repository root:

```bash
npm run test:e2e
```

**Note:** The development server must be running at the URL expected by the E2E configuration. The `test:e2e` script does not necessarily start the server automatically.

If the project includes a Python dependency file, use it to install the pinned dependencies for a reproducible environment.

### 6. Build for Production

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

---

## 📂 Project Structure

The following structure summarizes the main modules currently identified. Update it if the actual directory layout differs.

```text
OneonOneFinapp/
├── src/
│   ├── App.jsx
│   ├── FinAppContext.jsx
│   ├── DashboardView.jsx
│   ├── GastosView.jsx
│   ├── MetasView.jsx
│   ├── FinancialCharts.jsx
│   └── ...
├── tests_e2e/
│   ├── conftest.py
│   └── test_finapp_shared.py
├── package.json
├── package-lock.json
├── vite.config.js
├── index.html
└── README.md
```

Unit tests and business logic modules may be located in additional directories, depending on the current implementation.

---

## 🛡️ Quality, Risks & Limitations

The project considers common risks in financial applications:

- Monetary precision and rounding errors.
- Invalid expense-splitting percentages.
- Incorrect balances after editing or deleting transactions.
- Data loss after reloading the application.
- Inconsistencies between transactions and dashboard indicators.
- Usability and responsive design issues.
- Unauthorized access to personal information if multi-user features are introduced.

This is a demonstration project. It should not be considered production-ready financial software without appropriate security, privacy, architecture, and reliability assessments.

---

## 🗺️ Roadmap

- [x] Initial React + Vite application structure.
- [x] Introduction of unit testing tools.
- [x] Preparation of automated E2E scenarios.
- [ ] Verify all unit tests.
- [ ] Validate all E2E user flows.
- [ ] Expand edge-case coverage for expense splitting and settlements.
- [ ] Document actual defects and test results.
- [ ] Configure GitHub Actions CI/CD.
- [ ] Publish an accessible live demo.
- [ ] Add screenshots and portfolio documentation.

**Checklist items should only be marked as completed once the corresponding work has been verified.**

---

## 👩‍💻 About This Project

One on One FinApp is part of my independent learning journey in **Software Testing and QA Automation**.

My goal is to combine AI-assisted development with a quality-focused mindset: understanding requirements, anticipating risks, defining expected outcomes, designing test scenarios, and verifying the actual behavior of the software.

Because generating code is only one part of the process. Understanding what can fail and verifying that a solution meets its requirements are equally important.

**Repository:** [github.com/lmes4/OneonOneFinapp](https://github.com/lmes4/OneonOneFinapp)

---

*Project under development. Features, tools, and testing results should be interpreted according to the actual state of each published version.*
