import { NextResponse } from 'next/server'

// Static list of departments - can be moved to database later
const departments = [
  { id: 'dept-1', name: 'Phòng Kỹ thuật' },
  { id: 'dept-2', name: 'PX Vận hành' },
  { id: 'dept-3', name: 'Phòng Kế hoạch' },
  { id: 'dept-4', name: 'Ban Giám đốc' },
  { id: 'dept-5', name: 'Phòng Tài chính' },
  { id: 'dept-6', name: 'PX Sửa chữa Cơ' },
  { id: 'dept-7', name: 'PX Sửa chữa Điện' },
  { id: 'dept-8', name: 'PX TĐH-ĐK' },
]

// GET /api/departments - Get all departments
export async function GET() {
  try {
    return NextResponse.json({
      data: departments,
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    )
  }
}
