import { useEffect, useRef, useState } from 'react';

export default function KeyDialog({ open, initialValue, onClose }) {
  const dialogRef = useRef(null);
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      setValue(initialValue);
      if (!dialog.open) dialog.showModal();
    } else if (dialog.open) {
      dialog.close();
    }
  }, [open, initialValue]);

  function handleDialogClose() {
    const dialog = dialogRef.current;
    onClose(dialog.returnValue === 'save' ? value.trim() : null);
  }

  return (
    <dialog ref={dialogRef} onClose={handleDialogClose}>
      <form method="dialog">
        <h2>YouTube API 키</h2>
        <p>
          검색하려면 YouTube Data API v3 키가 필요해요. Google Cloud Console에서 발급받을 수 있고, 이 브라우저에만
          저장됩니다.
          <br />
          키 없이도 YouTube 링크를 붙여넣으면 바로 재생돼요.
        </p>
        <input
          placeholder="AIza..."
          spellCheck={false}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <div className="row">
          <button value="cancel" className="ghost">
            취소
          </button>
          <button value="save" className="primary">
            저장
          </button>
        </div>
      </form>
    </dialog>
  );
}
