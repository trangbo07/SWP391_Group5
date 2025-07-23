package controller;

import util.VnPayConfig;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@WebServlet("/api/vnpay/create-payment")
public class VnPayServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws ServletException, IOException {
        util.VnPayConfig.loadConfig(getServletContext());
        String amount = req.getParameter("amount");
        if (amount == null || amount.isEmpty()) {
            resp.setContentType("application/json");
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Missing or empty amount parameter\"}");
            return;
        }
        int amountValue = 0;
        try {
            amountValue = Integer.parseInt(amount);
        } catch (NumberFormatException e) {
            resp.setContentType("application/json");
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Amount must be a valid integer\"}");
            return;
        }
        if (amountValue <= 0) {
            resp.setContentType("application/json");
            resp.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            resp.getWriter().write("{\"error\": \"Amount must be greater than 0\"}");
            return;
        }
        String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
        String vnp_OrderInfo = "Thanh toan hoa don";
        String orderType = "other";
        String vnp_Amount = String.valueOf(amountValue * 100);
        String vnp_Locale = "vn";
        String vnp_BankCode = "VNBANK";
        String vnp_IpAddr = req.getRemoteAddr();

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", VnPayConfig.getTmnCode());
        vnp_Params.put("vnp_Amount", vnp_Amount);
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", orderType);
        vnp_Params.put("vnp_Locale", vnp_Locale);
        vnp_Params.put("vnp_ReturnUrl", VnPayConfig.getReturnUrl());
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", new SimpleDateFormat("yyyyMMddHHmmss").format(new Date()));
        // Thêm thời gian hết hạn link thanh toán (5 phút)
        Calendar expireCal = Calendar.getInstance();
        expireCal.add(Calendar.MINUTE, 5);
        String vnp_ExpireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(expireCal.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        for (String fieldName : fieldNames) {
            String value = vnp_Params.get(fieldName);
            if ((value != null) && (value.length() > 0)) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString())).append('&');
                query.append(fieldName).append('=')
                        .append(URLEncoder.encode(value, StandardCharsets.US_ASCII.toString())).append('&');
            }
        }
        hashData.deleteCharAt(hashData.length() - 1);
        query.deleteCharAt(query.length() - 1);

        String secureHash = "";
        try {
            secureHash = hmacSHA512(VnPayConfig.getHashSecret(), hashData.toString());
        } catch (Exception e) {
            e.printStackTrace();
        }
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = VnPayConfig.getPayUrl() + "?" + query.toString();

        resp.setContentType("application/json");
        PrintWriter out = resp.getWriter();
        out.print("{\"paymentUrl\": \"" + paymentUrl + "\"}");
        out.flush();
    }

    public static String hmacSHA512(String key, String data) throws Exception {
        javax.crypto.Mac hmac512 = javax.crypto.Mac.getInstance("HmacSHA512");
        javax.crypto.spec.SecretKeySpec secretKey = new javax.crypto.spec.SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac512.init(secretKey);
        byte[] bytes = hmac512.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hash = new StringBuilder();
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hash.append('0');
            hash.append(hex);
        }
        return hash.toString();
    }
} 