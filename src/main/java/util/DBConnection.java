package util;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DBConnection {
    // JDBC URL, username and password of SQL Server database
    private static final String URL = "jdbc:sqlserver://localhost:1433;databaseName=HealthCareSystem;encrypt=true;trustServerCertificate=true;";
    private static final String USER = "sa"; // Replace with your SQL Server username
    private static final String PASSWORD = "123"; // Replace with your SQL Server password

    // Load JDBC driver
    static {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        } catch (ClassNotFoundException e) {
            throw new RuntimeException("SQL Server JDBC Driver not found", e);
        }
    }

    // Get database connection
    public static Connection getConnection() throws SQLException {
        return DriverManager.getConnection(URL, USER, PASSWORD);
    }

    // Close connection
    public static void closeConnection(Connection conn) {
        if (conn != null) {
            try {
                conn.close();
            } catch (SQLException e) {
                // Log the exception
                e.printStackTrace();
            }
        }
    }
} 