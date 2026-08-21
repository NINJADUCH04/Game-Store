class TestCORS:
    def test_cors_preflight_allowed_origin(self, client):
        response = client.options(
            "/api/products",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )
        assert response.status_code in (200, 405)
        assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"
        assert response.headers.get("access-control-allow-methods") is not None
        assert response.headers.get("access-control-allow-headers") is not None

    def test_cors_preflight_disallowed_origin(self, client):
        response = client.options(
            "/api/products",
            headers={
                "Origin": "http://evil.com",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )
        assert "access-control-allow-origin" not in response.headers

    def test_cors_allowed_origin_on_get(self, client, db_session):
        response = client.get(
            "/api/products",
            headers={"Origin": "http://localhost:3000"},
        )
        assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"

    def test_cors_disallowed_origin_on_get(self, client, db_session):
        response = client.get(
            "/api/products",
            headers={"Origin": "http://evil.com"},
        )
        assert "access-control-allow-origin" not in response.headers
