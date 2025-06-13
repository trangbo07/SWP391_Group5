package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class Room {
    private int room_id;
    private String room_name, department, status;
}
