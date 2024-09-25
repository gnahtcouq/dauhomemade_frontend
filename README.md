# ĐẬU HOMEMADE

Tài khoản Admin

- Email: `admin@dau.stu.id.vn`
- Mật khẩu: `123456`

Tài khoản Nhân viên

- Email: `nhanvien@stu.id.vn`
- Mật khẩu: `123456`

## Ý tưởng

Ý tưởng từ phần mềm Sapo FNB: [QR Order trên Sapo FNB | Giải pháp gọi món tại bàn giúp quán tiết kiệm tối đa nguồn nhân lực](https://youtu.be/m8gCGGinoAs)

## Công nghệ sử dụng

- FrontEnd: Next.js 14 App Router, TypeScript, TailwindCSS, ShadCn UI, Tanstack Query, WebSockets (Socket.io)
- BackEnd: Fastify, Prisma, TypeScript, JWT, WebSockets (Socket.io)
- Database: SQLite

## Chức năng chính dự án

- Quản lý authentication bằng JWT Access Token và tự động Refresh Token
- Có phân quyền 3 role: Admin, Nhân viên, Khách hàng
- Hỗ trợ thanh toán online qua ZaloPay

Admin

- Quản lý tài khoản cá nhân
- Quản lý nhân viên
- Quản lý món ăn
- Quản lý bàn ăn
- Quản lý hóa đơn gọi món
- Thống kê doanh thu

Nhân viên

- Quản lý tài khoản cá nhân
- Quản lý hóa đơn gọi món

Khách hàng

- Xem menu
- Đặt món ăn bằng QR Code

## Vấn đề bản quyền

- Website được thực hiện với mục đích tích luỹ kiến thức, không có mục đích thương mại hoá
- Có sử dụng hình ảnh của [Đậu Homemade](https://dauhomemade.vn/)
