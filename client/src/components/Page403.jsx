const Page403 = () => {
    return (
        <section style={{ textAlign: "center", padding: "4rem 2rem" }}>
            <h1 style={{ fontSize: "3rem", color: "#cc0000" }}>⛔ 403 - Access Denied</h1>
            <p style={{ fontSize: "1.25rem" }}>
                You don&apos;t have permission to access this page.
            </p>
            <p style={{ marginTop: "2rem" }}>
                Please <a href="/auth/login" style={{ color: "#007bff" }}>login</a> with the correct account or go <a href="/" style={{ color: "#007bff" }}>back to homepage</a>.
            </p>
        </section>
    );
};

export default Page403;
