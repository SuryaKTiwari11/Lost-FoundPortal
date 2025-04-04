import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/app/libs/mongodb";
import User from "@/model/user.model";

export async function POST(request: Request) {
  try {
    const { firstName, lastName, rollNumber, universityEmail, password } =
      await request.json();

    // Basic validation
    if (
      !firstName ||
      !lastName ||
      !rollNumber ||
      !universityEmail ||
      !password
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ universityEmail }, { rollNumber }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User with this email or roll number already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      rollNumber,
      universityEmail,
      password: hashedPassword,
      verified: false,
      isAcceptingMessages: true,
      createdAt: new Date(),
    });

    await newUser.save();

    return NextResponse.json(
      { message: "User registered successfully" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: `Registration failed: ${error.message}` },
      { status: 500 }
    );
  }
}
