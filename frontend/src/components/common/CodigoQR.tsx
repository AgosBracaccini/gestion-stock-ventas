import { useEffect, useState } from "react";
import * as QRCode from "qrcode";

/** Genera un QR (imagen en base64) a partir de un texto/URL, directo en el navegador. */
export function CodigoQR({ valor, tamano = 180 }: { valor: string; tamano?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;

    QRCode.toDataURL(valor, { width: tamano, margin: 1 })
      .then((url) => {
        if (!cancelado) setDataUrl(url);
      })
      .catch(() => {
        if (!cancelado) setDataUrl(null);
      });

    return () => {
      cancelado = true;
    };
  }, [valor, tamano]);

  if (!dataUrl) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground"
        style={{ width: tamano, height: tamano }}
      >
        Generando QR...
      </div>
    );
  }

  return <img src={dataUrl} alt="Código QR" width={tamano} height={tamano} />;
}