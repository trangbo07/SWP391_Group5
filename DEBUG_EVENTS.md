# Debug Guide for Doctor Search Events

## Cách kiểm tra xem onChange có hoạt động không

### 1. Mở Developer Tools
- Nhấn F12 hoặc chuột phải -> Inspect
- Chuyển sang tab Console

### 2. Kiểm tra các elements có tồn tại không
```javascript
// Chạy trong console
console.log('Search Input:', document.getElementById('searchInput'));
console.log('Department Filter:', document.getElementById('departmentFilter'));
console.log('Sort Select:', document.getElementById('sortSelect'));
console.log('Clear Filters:', document.getElementById('clearFilters'));
```

### 3. Kiểm tra global functions
```javascript
// Chạy trong console
window.testGlobalFunctions();
```

### 4. Test manual events
```javascript
// Test search input
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    searchInput.value = 'test';
    searchInput.dispatchEvent(new Event('input'));
    searchInput.dispatchEvent(new Event('change'));
}

// Test department filter
const deptFilter = document.getElementById('departmentFilter');
if (deptFilter) {
    deptFilter.value = 'Cardiology';
    deptFilter.dispatchEvent(new Event('change'));
}

// Test sort select
const sortSelect = document.getElementById('sortSelect');
if (sortSelect) {
    sortSelect.value = 'name-desc';
    sortSelect.dispatchEvent(new Event('change'));
}

// Test clear filters
const clearBtn = document.getElementById('clearFilters');
if (clearBtn) {
    clearBtn.click();
}
```

### 5. Kiểm tra event listeners
```javascript
// Kiểm tra xem có event listeners nào được attach không
const searchInput = document.getElementById('searchInput');
if (searchInput) {
    console.log('Search input event listeners:', getEventListeners(searchInput));
}
```

### 6. Các vấn đề thường gặp

#### Vấn đề 1: Elements chưa được load
**Giải pháp:** Đảm bảo script chạy sau khi DOM đã load
```javascript
document.addEventListener('DOMContentLoaded', function() {
    // Code ở đây
});
```

#### Vấn đề 2: Bootstrap chưa được load
**Giải pháp:** Kiểm tra xem Bootstrap có được load không
```javascript
console.log('Bootstrap Modal:', typeof bootstrap);
console.log('Bootstrap Tooltip:', typeof bootstrap?.Tooltip);
```

#### Vấn đề 3: API endpoints không hoạt động
**Giải pháp:** Kiểm tra network tab trong developer tools
```javascript
// Test API endpoints
fetch('/api/doctors')
    .then(response => response.json())
    .then(data => console.log('Doctors API:', data))
    .catch(error => console.error('API Error:', error));
```

### 7. Cách sửa nhanh

Nếu onChange không hoạt động, có thể thêm inline events:

```html
<select id="departmentFilter" onchange="console.log('Department changed:', this.value)">
    <option value="">Tất cả chuyên khoa</option>
</select>
```

### 8. Log messages để theo dõi

Trong file `listdoctors.js`, đã thêm các console.log để debug:
- `Department filter changed: [value]`
- `Sort changed: [value]`
- `Clear filters clicked`

Kiểm tra console để xem các messages này có xuất hiện không khi thao tác với các controls. 