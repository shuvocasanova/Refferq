import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { getCurrencySymbol } from '@/lib/currency';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET!
);

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      throw new Error('No token found');
    }
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string;
    // Get user from database to ensure they still exist and get latest data

    // Get user from database to ensure they still exist and get latest data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        affiliate: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 401 }
      );
    }

    const currencySymbol = await getCurrencySymbol();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        hasAffiliate: !!user.affiliate,
        profilePicture: user.profilePicture,
        currencySymbol,
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}