package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Distributor {
    private int DistributorID;
    private String DistributorName, Address, DistributorEmail, DistributorPhone;
}
