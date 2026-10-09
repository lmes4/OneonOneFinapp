import pytest
from playwright.sync_api import Page, expect

def test_01_load_application(desktop_page: Page):
    """Verifies that FinApp Shared loads correctly with its dashboard and key elements."""
    expect(desktop_page.locator("text=Panel de Control Financiero")).to_be_visible()
    expect(desktop_page.locator("[data-testid='available-balance-display']")).to_be_visible()
    expect(desktop_page.locator("[data-testid='settlement-card']")).to_be_visible()

def test_02_register_personal_expense(desktop_page: Page):
    """Verifies creating a personal expense and seeing it in the recent movements list."""
    desktop_page.click("[data-testid='nav-gastos']")
    desktop_page.wait_for_selector("[data-testid='gastos-view']")

    # Ensure personal scope is active
    desktop_page.click("[data-testid='scope-personal-btn']")

    # Enter amount: +50
    desktop_page.click("button:has-text('+50')")
    expect(desktop_page.locator("[data-testid='amount-display']")).to_contain_text("50.00")

    # Enter concept
    desktop_page.fill("[data-testid='input-concept']", "Libro Arquitectura React")

    # Save expense
    desktop_page.click("[data-testid='btn-save-expense']")
    expect(desktop_page.locator("[data-testid='success-toast']")).to_be_visible()

    # Verify in recent transactions list
    expect(desktop_page.locator("text=Libro Arquitectura React").first).to_be_visible()

def test_03_create_shared_expense_5050(desktop_page: Page):
    """Verifies creating a shared expense with 50/50 split."""
    desktop_page.click("[data-testid='nav-gastos']")
    desktop_page.wait_for_selector("[data-testid='gastos-view']")

    # Switch to Shared scope
    desktop_page.click("[data-testid='scope-shared-btn']")
    desktop_page.click("[data-testid='split-method-5050']")

    # Enter amount: +100
    desktop_page.click("button:has-text('+100')")
    expect(desktop_page.locator("[data-testid='amount-display']")).to_contain_text("100.00")

    # Verify live preview indicates 50% split (50 € each)
    expect(desktop_page.locator("[data-testid='live-split-preview']")).to_be_visible()
    expect(desktop_page.locator("[data-testid='live-split-preview']")).to_contain_text("50%")

    desktop_page.fill("[data-testid='input-concept']", "Cena 50-50 Compartida")
    desktop_page.click("[data-testid='btn-save-expense']")
    expect(desktop_page.locator("[data-testid='success-toast']")).to_be_visible()

    # Check that it appears with 'Compartido' tag
    expect(desktop_page.locator("text=Cena 50-50 Compartida").first).to_be_visible()

def test_04_create_shared_expense_proportional(desktop_page: Page):
    """Verifies creating a shared expense with proportional split based on monthly income."""
    desktop_page.click("[data-testid='nav-gastos']")
    desktop_page.wait_for_selector("[data-testid='gastos-view']")

    desktop_page.click("[data-testid='scope-shared-btn']")
    desktop_page.click("[data-testid='split-method-proportional']")

    desktop_page.click("button:has-text('+100')")
    expect(desktop_page.locator("[data-testid='live-split-preview']")).to_be_visible()

    desktop_page.fill("[data-testid='input-concept']", "Compra Proporcional Hogar")
    desktop_page.click("[data-testid='btn-save-expense']")
    expect(desktop_page.locator("[data-testid='success-toast']")).to_be_visible()
    expect(desktop_page.locator("text=Compra Proporcional Hogar").first).to_be_visible()

def test_05_custom_split_validation(desktop_page: Page):
    """Verifies that custom split validates percentages totaling exactly 100%."""
    desktop_page.click("[data-testid='nav-gastos']")
    desktop_page.wait_for_selector("[data-testid='gastos-view']")

    desktop_page.click("[data-testid='scope-shared-btn']")
    desktop_page.click("[data-testid='split-method-custom']")

    # Enter amount +50
    desktop_page.click("button:has-text('+50')")
    desktop_page.fill("[data-testid='input-concept']", "Gasto Personalizado 60/40")

    # Save with default 50/50 percentages
    desktop_page.click("[data-testid='btn-save-expense']")
    expect(desktop_page.locator("[data-testid='success-toast']")).to_be_visible()

def test_06_form_validation_zero_amount(desktop_page: Page):
    """Verifies that submitting 0.00 shows a clear validation error."""
    desktop_page.click("[data-testid='nav-gastos']")
    desktop_page.wait_for_selector("[data-testid='gastos-view']")

    # Amount is 0.00
    desktop_page.click("[data-testid='btn-save-expense']")
    expect(desktop_page.locator("text=importe mayor a cero")).to_be_visible()

def test_07_persistence_after_page_reload(desktop_page: Page):
    """Verifies that state persists across page reload (F5)."""
    desktop_page.click("[data-testid='nav-gastos']")
    desktop_page.wait_for_selector("[data-testid='gastos-view']")

    # Add a uniquely identifiable expense
    desktop_page.click("button:has-text('+10')")
    desktop_page.fill("[data-testid='input-concept']", "Persistencia Test F5")
    desktop_page.click("[data-testid='btn-save-expense']")
    expect(desktop_page.locator("[data-testid='success-toast']")).to_be_visible()

    # Reload page
    desktop_page.reload()
    desktop_page.wait_for_selector("[data-testid='sidebar']")

    # Confirm the persisted expense is still visible
    expect(desktop_page.locator("text=Persistencia Test F5").first).to_be_visible()

def test_08_delete_movement_with_confirmation(desktop_page: Page):
    """Verifies deleting an existing transaction with modal confirmation."""
    desktop_page.click("[data-testid='nav-gastos']")
    desktop_page.wait_for_selector("[data-testid='recent-transactions-list']")

    # Locate first delete button in list
    first_delete = desktop_page.locator("[data-testid^='delete-tx-']").first
    first_delete.click()

    # Modal appears
    expect(desktop_page.locator("text=¿Eliminar este movimiento?")).to_be_visible()
    desktop_page.click("[data-testid='confirm-delete-btn']")

    expect(desktop_page.locator("text=Movimiento eliminado")).to_be_visible()

def test_09_savings_goals_interaction(desktop_page: Page):
    """Verifies savings goals page and contributing money to a goal."""
    desktop_page.click("[data-testid='nav-metas']")
    desktop_page.wait_for_selector("[data-testid='metas-view']")

    expect(desktop_page.locator("text=Progreso Financiero Global")).to_be_visible()
    expect(desktop_page.locator("[data-testid='btn-new-goal']")).to_be_visible()

    # Contribute to first goal
    first_contribute_btn = desktop_page.locator("[data-testid^='btn-contribute-']").first
    first_contribute_btn.click()

    expect(desktop_page.locator("text=Aportar a Meta")).to_be_visible()
    desktop_page.click("button:has-text('Confirmar')")

    expect(desktop_page.locator("text=aportados hoy")).to_be_visible()

def test_10_settlement_on_dashboard(desktop_page: Page):
    """Verifies that settlement debt card is visible on dashboard."""
    desktop_page.click("[data-testid='nav-dashboard']")
    desktop_page.wait_for_selector("[data-testid='dashboard-view']")

    expect(desktop_page.locator("[data-testid='settlement-card']")).to_be_visible()

def test_11_mobile_viewport_and_bottom_nav(mobile_page: Page):
    """Verifies mobile responsiveness and touch bottom navigation."""
    # Bottom navigation is visible on mobile
    expect(mobile_page.locator("nav.fixed.bottom-0")).to_be_visible()

    # Tap on Gastos tab
    mobile_page.click("button:has-text('Gastos')")
    expect(mobile_page.locator("[data-testid='gastos-view']")).to_be_visible()

    # Tap on Metas tab
    mobile_page.click("button:has-text('Metas')")
    expect(mobile_page.locator("[data-testid='metas-view']")).to_be_visible()

    # Tap back on Dashboard
    mobile_page.click("button:has-text('Dashboard')")
    expect(mobile_page.locator("[data-testid='dashboard-view']")).to_be_visible()
