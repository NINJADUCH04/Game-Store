class TestRegister:
    def test_register_success(self, client):
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "new@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "new@example.com"
        assert "id" in data
        assert "created_at" in data

    def test_register_duplicate_username(self, client, test_user):
        response = client.post(
            "/api/auth/register",
            json={
                "username": "testuser",
                "email": "different@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 400
        assert "Username already registered" in response.json()["detail"]

    def test_register_duplicate_email(self, client, test_user):
        response = client.post(
            "/api/auth/register",
            json={
                "username": "differentuser",
                "email": "test@example.com",
                "password": "password123",
            },
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_register_invalid_email(self, client):
        response = client.post(
            "/api/auth/register",
            json={
                "username": "newuser",
                "email": "not-an-email",
                "password": "password123",
            },
        )
        assert response.status_code == 422


class TestLogin:
    def test_login_success(self, client, test_user):
        response = client.post(
            "/api/auth/login",
            data={"username": "testuser", "password": "testpass123"},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client, test_user):
        response = client.post(
            "/api/auth/login",
            data={"username": "testuser", "password": "wrongpassword"},
        )
        assert response.status_code == 401
        assert "Invalid username or password" in response.json()["detail"]

    def test_login_nonexistent_user(self, client):
        response = client.post(
            "/api/auth/login",
            data={"username": "nouser", "password": "password"},
        )
        assert response.status_code == 401

    def test_login_missing_fields(self, client):
        response = client.post("/api/auth/login", data={})
        assert response.status_code == 422


class TestTokenValidation:
    def test_protected_route_without_token(self, client):
        response = client.get("/api/products")
        assert response.status_code == 401

    def test_protected_route_with_invalid_token(self, client):
        response = client.get(
            "/api/products", headers={"Authorization": "Bearer invalidtoken"}
        )
        assert response.status_code == 401

    def test_protected_route_with_valid_token(self, client, auth_headers):
        response = client.get("/api/products", headers=auth_headers)
        assert response.status_code == 200
