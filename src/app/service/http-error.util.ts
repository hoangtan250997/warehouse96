function translateBackendError(msg: string): string {
  // Inventory not available
  const inventoryMatch = msg.match(/Inventory item (\d+) is not available for delivery \(current status: InventoryStatus\.(\w+)\)/);
  if (inventoryMatch) {
    const statusMap: Record<string, string> = {
      DELIVERED: 'đã được xuất kho',
      SOLD: 'đã bán',
      RETURNED: 'đã trả hàng',
      DAMAGED: 'bị hỏng',
      RESERVED: 'đang được giữ chỗ',
      AVAILABLE: 'có sẵn',
    };
    const status = statusMap[inventoryMatch[2]] ?? inventoryMatch[2];
    return `Sản phẩm tồn kho #${inventoryMatch[1]} không thể xuất (trạng thái hiện tại: ${status})`;
  }
  if (/not available/i.test(msg)) return msg.replace(/not available/gi, 'không khả dụng');
  if (/not found/i.test(msg)) return msg.replace(/not found/gi, 'không tìm thấy');
  if (/already exists/i.test(msg)) return msg.replace(/already exists/gi, 'đã tồn tại');
  if (/invalid/i.test(msg)) return msg.replace(/invalid/gi, 'không hợp lệ');
  if (/unauthorized/i.test(msg)) return 'Không có quyền truy cập';
  if (/forbidden/i.test(msg)) return 'Bị từ chối truy cập';
  if (/internal server error/i.test(msg)) return 'Lỗi máy chủ nội bộ';
  return msg;
}

export function extractHttpError(err: any, fallback: string): string {
  if (!err) return fallback;
  const detail = err?.error?.detail;
  if (typeof detail === 'string' && detail) return translateBackendError(detail);
  if (Array.isArray(detail)) return detail.map((d: any) => translateBackendError(d?.msg ?? JSON.stringify(d))).join('; ');
  const msg = err?.message;
  if (typeof msg === 'string' && msg && msg !== 'Http failure response') return translateBackendError(msg);
  const errBody = err?.error;
  if (errBody && typeof errBody === 'object' && !(errBody instanceof ProgressEvent) && !(errBody instanceof Event)) {
    const s = JSON.stringify(errBody);
    if (s !== '{}') return s;
  }
  if (typeof errBody === 'string' && errBody) return translateBackendError(errBody);
  return fallback;
}
