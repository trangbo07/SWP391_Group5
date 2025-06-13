package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class ImportInfo {
    private int ImportID, DistributorID, medicine_id;
    private String ImportDate, ImportAmount;
}
