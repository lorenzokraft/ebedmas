import { Request, Response } from 'express';
import pool from '../utils/db';
import { ResultSetHeader } from 'mysql2';

export const createQuoteRequest = async (req: Request, res: Response) => {
  try {
    const {
      // Contact Information
      name,
      email,
      phoneNumber,
      position,
      
      // School Information
      schoolName,
      address,
      townCity,
      lga,
      country,
      
      // Implementation Details
      schoolType,
      subjects,
      studentYearLevels,
      numberOfStudents,
      numberOfTeachers,
      implementationPlan,
      marketingConsent,
    } = req.body;

    // Validate required fields
    if (!name || !email || !phoneNumber || !schoolName || !schoolType) {
      return res.status(400).json({
        message: 'Missing required fields',
      });
    }

    // Validate school type
    if (!['Private', 'Government Public School'].includes(schoolType)) {
      return res.status(400).json({
        message: 'Invalid school type',
      });
    }

    // Insert into database
    const [result] = await pool.query<ResultSetHeader>(
      `INSERT INTO school_quote_requests (
        name, email, phone_number, position,
        school_name, address, town_city, lga, country,
        school_type, subjects, student_year_levels,
        number_of_students, number_of_teachers,
        implementation_plan, marketing_consent
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email,
        phoneNumber,
        position,
        schoolName,
        address,
        townCity,
        lga,
        country,
        schoolType,
        // Convert subjects object to string
        typeof subjects === 'string' ? subjects : JSON.stringify(subjects),
        studentYearLevels,
        Number(numberOfStudents),
        Number(numberOfTeachers),
        implementationPlan || '',
        marketingConsent ? 1 : 0,
      ]
    );

    res.status(201).json({
      message: 'Quote request submitted successfully',
      requestId: result.insertId,
    });
  } catch (error) {
    console.error('Error creating quote request:', error);
    res.status(500).json({
      message: 'Failed to submit quote request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getQuoteRequests = async (req: Request, res: Response) => {
  try {
    const [requests] = await pool.query(
      `SELECT * FROM school_quote_requests ORDER BY created_at DESC`
    );

    res.status(200).json(requests);
  } catch (error) {
    console.error('Error fetching quote requests:', error);
    res.status(500).json({
      message: 'Failed to fetch quote requests',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const updateQuoteRequestStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!['pending', 'contacted', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        message: 'Invalid status',
      });
    }

    await pool.query(
      `UPDATE school_quote_requests SET status = ?, notes = ? WHERE id = ?`,
      [status, notes, id]
    );

    res.status(200).json({
      message: 'Quote request updated successfully',
    });
  } catch (error) {
    console.error('Error updating quote request:', error);
    res.status(500).json({
      message: 'Failed to update quote request',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
