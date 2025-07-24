package dao;
import java.sql.Connection;
import java.sql.DriverManager;

public class DBContext {
    private static final DBContext instance = new DBContext();

    private final String user = "sa";
    private final String password = "123";
    private final String url = "jdbc:sqlserver://localhost:1433;databaseName=HealthCareSystem;TrustServerCertificate=true";

    static {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
        }
    }

    private DBContext() {}

    public static DBContext getInstance() {
        return instance;
    }

    public Connection getConnection() {
        try {
            return DriverManager.getConnection(url, user, password);
        } catch (Exception e) {
            e.printStackTrace();
            return null;
        }
    }
}