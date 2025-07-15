package util;

import jakarta.servlet.http.Part;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Paths;
import java.util.Set;

public final class ImageCheckUtil {

    private ImageCheckUtil() {}                            // chặn khởi tạo

    public static final long MAX_IMG_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
        "image/jpeg",  "image/pjpeg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/apng",
        "image/avif",
        "image/bmp",
        "image/x-icon", "image/vnd.microsoft.icon",
        "image/heic",  "image/heif",
        "image/tiff",
        "image/svg+xml",
        "image/x-xbitmap"
    );

    private static final Set<String> ALLOWED_EXTS = Set.of(
        "xbm","tif","tiff","jfif","pjp","apng","jpeg",
        "heif","ico","webp","svgz","jpg","heic","gif",
        "svg","png","bmp","pjpeg","avif"
    );

    public static boolean isMimeAndSizeValid(Part part) {
        if (part == null) return false;

        if (!ALLOWED_MIME_TYPES.contains(part.getContentType())) return false;

        if (part.getSize() == 0 || part.getSize() > MAX_IMG_SIZE) return false;

        String filename = Paths.get(part.getSubmittedFileName())
                               .getFileName().toString().toLowerCase();
        int dot = filename.lastIndexOf('.');
        if (dot == -1) return false;
        String ext = filename.substring(dot + 1);
        return ALLOWED_EXTS.contains(ext);
    }

    public static boolean isActualImage(Part part) {
        if (part == null || part.getSize() == 0) return false;
        try (InputStream in = part.getInputStream()) {
            BufferedImage img = ImageIO.read(in);
            return img != null;
        } catch (IOException e) {
            return false;
        }
    }
}
