const API_PORT = 3000;

export async function apiFetch(prompt, data = {}) {
    try {
        data.credentials = "include";

        let result = await fetch(prompt, data);

        if (result.status !== 401) {
            return result;
        }

        const refresh = await fetch(
            `http://localhost:${API_PORT}/api/auth/refreshToken`,
            {
                method: "POST",
                credentials: "include"
            }
        );

        if (!refresh.ok) {
            window.location.href = "/auth";
            return;
        }

        result = await fetch(prompt, data);

        return result;

    } catch (err) {
        console.error(err);
    }
}