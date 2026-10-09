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
