package dto;

public class InvoiceItemDTO {
    private int itemId;
    private String itemName;
    private String itemType; 
    private int quantity;
    private double unitPrice;
    private double totalPrice;
    private String description;

    public InvoiceItemDTO() {}

    public InvoiceItemDTO(int itemId, String itemName, String itemType, 
                         int quantity, double unitPrice, double totalPrice, String description) {
        this.itemId = itemId;
        this.itemName = itemName;
        this.itemType = itemType;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.totalPrice = totalPrice;
        this.description = description;
    }

    // Getters and Setters
    public int getItemId() { return itemId; }
    public void setItemId(int itemId) { this.itemId = itemId; }

    public String getItemName() { return itemName; }
    public void setItemName(String itemName) { this.itemName = itemName; }

    public String getItemType() { return itemType; }
    public void setItemType(String itemType) { this.itemType = itemType; }

    public int getQuantity() { return quantity; }
    public void setQuantity(int quantity) { this.quantity = quantity; }

    public double getUnitPrice() { return unitPrice; }
    public void setUnitPrice(double unitPrice) { this.unitPrice = unitPrice; }

    public double getTotalPrice() { return totalPrice; }
    public void setTotalPrice(double totalPrice) { this.totalPrice = totalPrice; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
} 