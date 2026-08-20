class TestListProducts:
    def test_list_products_empty(self, client, auth_headers):
        response = client.get("/api/products", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["page_size"] == 10
        assert data["total_pages"] == 1

    def test_list_products_with_data(self, client, auth_headers, test_products):
        response = client.get("/api/products", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] == 15
        assert data["total_pages"] == 2

    def test_list_products_pagination(self, client, auth_headers, test_products):
        response = client.get("/api/products?page=2&page_size=10", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
        assert data["page"] == 2

    def test_list_products_filter_by_location_jo(self, client, auth_headers, test_products):
        response = client.get("/api/products?location=JO", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert all(item["location"] == "JO" for item in data["items"])

    def test_list_products_filter_by_location_sa(self, client, auth_headers, test_products):
        response = client.get("/api/products?location=SA", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert all(item["location"] == "SA" for item in data["items"])

    def test_list_products_invalid_location(self, client, auth_headers):
        response = client.get("/api/products?location=US", headers=auth_headers)
        assert response.status_code == 422

    def test_list_products_unauthorized(self, client):
        response = client.get("/api/products")
        assert response.status_code == 401


class TestGetProduct:
    def test_get_product_success(self, client, auth_headers, test_product):
        response = client.get(f"/api/products/{test_product.id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Game"
        assert data["price"] == 29.99
        assert data["location"] == "JO"

    def test_get_product_not_found(self, client, auth_headers):
        response = client.get("/api/products/999", headers=auth_headers)
        assert response.status_code == 404
        assert "Product not found" in response.json()["detail"]

    def test_get_product_unauthorized(self, client, test_product):
        response = client.get(f"/api/products/{test_product.id}")
        assert response.status_code == 401
