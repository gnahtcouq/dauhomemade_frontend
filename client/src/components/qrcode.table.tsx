'use client'

import {getTableLink} from '@/lib/utils'
import QRCode from 'qrcode'
import {useEffect, useRef} from 'react'

export default function QRCodeTable({
  token,
  tableNumber,
  width = 250
}: {
  token: string
  tableNumber: number
  width?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    canvas.width = width
    canvas.height = width + 70
    const canvasContext = canvas.getContext('2d')!
    canvasContext.fillStyle = 'white'
    canvasContext.fillRect(0, 0, canvas.width, canvas.height)
    canvasContext.font = '20px Arial'
    canvasContext.textAlign = 'center'
    canvasContext.fillStyle = 'black'
    canvasContext.fillText(
      `Bàn số ${tableNumber}`,
      canvas.width / 2,
      canvas.width + 20
    )
    canvasContext.fillText(
      'Quét mã QR để gọi món',
      canvas.width / 2,
      canvas.width + 50
    )

    const virtualCanvas = document.createElement('canvas')

    QRCode.toCanvas(
      virtualCanvas,
      getTableLink({
        token,
        tableNumber
      }),
      {
        width: width,
        margin: 4
      },
      function (error) {
        if (error) console.error(error)
        canvasContext.drawImage(virtualCanvas, 0, 0, width, width)
      }
    )
  }, [token, tableNumber, width])

  return <canvas ref={canvasRef} />
}
