package model;

import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
public class InternalAnnouncement {
    private int announcement_id, created_by_admin_business, created_by_admin_system;
    private String title,content ,created_at;
}
