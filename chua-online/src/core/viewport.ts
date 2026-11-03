/**
 * Tối ưu hóa viewport trên thiết bị di động (iOS Safari / Android Chrome).
 * Sử dụng visualViewport API để tự động co dãn biến CSS --vvh và vị trí HUD
 * mà không làm giật khung nhìn canvas WebGL khi bàn phím ảo xuất hiện.
 */
export function initViewport(): void {
  const updateViewport = () => {
    const vv = window.visualViewport;
    const height = vv ? vv.height : window.innerHeight;
    const offsetTop = vv ? vv.offsetTop : 0;

    document.documentElement.style.setProperty("--vvh", `${height}px`);
    document.documentElement.style.setProperty("--vv-top", `${offsetTop}px`);
  };

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", updateViewport);
    window.visualViewport.addEventListener("scroll", updateViewport);
  }
  window.addEventListener("resize", updateViewport);
  updateViewport();
}
