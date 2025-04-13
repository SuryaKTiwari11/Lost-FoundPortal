"use server";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { format } from "date-fns";
import dbConnect from "@/lib/dbConnect";
import User from "@/model/user.model";
import { generateUsername } from "@/helper/generateUsername";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json(
        { success: false, message: "Empty request body" },
        { status: 400 }
      );
    }

    await dbConnect();

    const { firstName, lastName, rollNumber, email, password } = body;

    const username = body.username || generateUsername(firstName, lastName);

    if (!firstName || !lastName || !rollNumber || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if user exists and is verified by username
    const existingUserByUsername = await User.findOne({ username });
    if (existingUserByUsername && existingUserByUsername.isVerified) {
      return NextResponse.json(
        { success: false, message: "Username already exists" },
        { status: 409 }
      );
    }

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verifyCodeExpiry = format(
      new Date(Date.now() + 60 * 60 * 1000),
      "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
    ); // 1 hour from now
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists by email
    const existingUserByEmail = await User.findOne({ universityEmail: email });

    if (existingUserByEmail) {
      // If user exists but is not verified, update details
      if (!existingUserByEmail.isVerified) {
        existingUserByEmail.username = username;
        existingUserByEmail.firstName = firstName;
        existingUserByEmail.lastName = lastName;
        existingUserByEmail.password = hashedPassword;
        existingUserByEmail.verifyCode = verifyCode;
        existingUserByEmail.verifyCodeExpiry = verifyCodeExpiry;

        await existingUserByEmail.save();

        // Return success response without sending email
        return NextResponse.json(
          {
            success: true,
            message:
              "User updated successfully. Please contact admin for verification.",
          },
          { status: 200 }
        );
      } else {
        // User exists and is verified
        return NextResponse.json(
          { success: false, message: "Email already registered" },
          { status: 409 }
        );
      }
    } else {
      // Create new user
      const newUser = new User({
        username,
        firstName,
        lastName,
        rollNumber,
        universityEmail: email,
        password: hashedPassword,
        verifyCode,
        isVerified: false, // Set to false by default, admin will verify
        verifyCodeExpiry,
      });

      await newUser.save();

      // Return success response without sending email
      return NextResponse.json(
        {
          success: true,
          message:
            "User registered successfully. Please contact admin for verification.",
        },
        { status: 201 }
      );
    }
  } catch (error: any) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to register user" },
      { status: 500 }
    );
  }
}
