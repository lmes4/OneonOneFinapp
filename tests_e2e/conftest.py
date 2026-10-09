import pytest
from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:5173"

@pytest.fixture(scope="session")
def playwright_instance():
    with sync_playwright() as p:
        yield p

@pytest.fixture(scope="function")
def browser(playwright_instance):
    browser = playwright_instance.chromium.launch(headless=True)
    yield browser
    browser.close()

@pytest.fixture(scope="function")
def desktop_page(browser):
    context = browser.new_context(viewport={"width": 1280, "height": 800})
    page = context.new_page()
    page.goto(BASE_URL)
    page.wait_for_selector("[data-testid='sidebar']", timeout=10000)
    yield page
    context.close()

@pytest.fixture(scope="function")
def mobile_page(browser):
    # iPhone 14/15 dimensions
    context = browser.new_context(
        viewport={"width": 390, "height": 844},
        is_mobile=True,
        has_touch=True
    )
    page = context.new_page()
    page.goto(BASE_URL)
    page.wait_for_selector("nav.fixed.bottom-0", timeout=10000)
    yield page
    context.close()
