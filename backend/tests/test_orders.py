class TestCreateOrder:
    def test_create_order_success(self, client, auth_headers, test_product):
        response = client.post(
            "/api/orders",
            json={"product_id": test_product.id},
            headers=auth_headers,
        )
        assert response.status_code == 200
        data = response.json()
        assert data["product_id"] == test_product.id
        assert data["product_title"] == test_product.title
        assert data["unit_price"] == test_product.price
        assert data["buyer_username"] == "testuser"
        assert "id" in data
        assert "created_at" in data

    def test_create_order_product_not_found(self, client, auth_headers):
        response = client.post(
            "/api/orders",
            json={"product_id": 999},
            headers=auth_headers,
        )
        assert response.status_code == 404
        assert "Product not found" in response.json()["detail"]

    def test_create_order_unauthorized(self, client, test_product):
        response = client.post(
            "/api/orders",
            json={"product_id": test_product.id},
        )
        assert response.status_code == 401

    def test_create_order_invalid_payload(self, client, auth_headers):
        response = client.post(
            "/api/orders",
            json={},
            headers=auth_headers,
        )
        assert response.status_code == 422


class TestGetOrder:
    def test_get_order_success(self, client, auth_headers, test_product):
        create_response = client.post(
            "/api/orders",
            json={"product_id": test_product.id},
            headers=auth_headers,
        )
        order_id = create_response.json()["id"]

        response = client.get(f"/api/orders/{order_id}", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == order_id
        assert data["product_title"] == test_product.title

    def test_get_order_not_found(self, client, auth_headers):
        response = client.get("/api/orders/999", headers=auth_headers)
        assert response.status_code == 404
        assert "Order not found" in response.json()["detail"]

    def test_get_order_wrong_user(self, client, auth_headers, test_product, db_session):
        from app.core.models import User
        from app.core.auth import get_password_hash, create_access_token

        other_user = User(
            username="otheruser",
            email="other@example.com",
            hashed_password=get_password_hash("otherpass"),
        )
        db_session.add(other_user)
        db_session.commit()
        db_session.refresh(other_user)

        create_response = client.post(
            "/api/orders",
            json={"product_id": test_product.id},
            headers=auth_headers,
        )
        order_id = create_response.json()["id"]

        other_token = create_access_token(data={"sub": other_user.username})
        other_headers = {"Authorization": f"Bearer {other_token}"}

        response = client.get(f"/api/orders/{order_id}", headers=other_headers)
        assert response.status_code == 404

    def test_get_order_unauthorized(self, client, test_product):
        response = client.get("/api/orders/1")
        assert response.status_code == 401
