<?php

namespace App\Http\Controllers;

use App\Models\Student;
use App\Models\Address;
use App\Models\EmergencyContact;
use App\Models\FamilyMember;
use App\Models\FinancialInformation;
use App\Models\AcademicRecord;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;

class StudentController extends Controller
{
    /**
     * Display a listing of students
     */
    public function index(Request $request): JsonResponse
    {
        $query = Student::with([
            'addresses',
            'familyMembers',
            'financialInformation',
            'academicRecords',
            'currentAcademicRecord.school'
        ]);

        // Get authenticated user from middleware
        $authUser = $request->get('auth_user');
        if ($authUser && isset($authUser['id'])) {
            $isAdmin = isset($authUser['role']) && strtolower($authUser['role']) === 'admin';
            if (!$isAdmin) {
                // Non-admins: only see their own records
                $userId = $authUser['id'];
                $query->where('user_id', $userId);
            }
        } else {
            // If no authenticated user, return empty results
            $query->where('id', 0); // This will return no results
        }

        // Apply filters
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('student_id_number', 'like', "%{$search}%")
                  ->orWhere('email_address', 'like', "%{$search}%");
            });
        }

        if ($request->has('is_pwd')) {
            $query->where('is_pwd', $request->boolean('is_pwd'));
        }

        if ($request->has('is_solo_parent')) {
            $query->where('is_solo_parent', $request->boolean('is_solo_parent'));
        }

        if ($request->has('is_currently_enrolled')) {
            $query->where('is_currently_enrolled', $request->boolean('is_currently_enrolled'));
        }

        $students = $query->orderBy('created_at', 'desc')
                         ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $students
        ]);
    }

    /**
     * Store a newly created student
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'citizen_id' => 'required|string|max:64',
            'user_id' => 'nullable|integer',
            'student_id_number' => 'nullable|string|max:255|unique:students,student_id_number',
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:255',
            'sex' => 'required|in:Male,Female',
            'civil_status' => 'required|in:Single,Married,Widowed,Divorced,Separated',
            'nationality' => 'nullable|string|max:255',
            'birth_place' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'is_pwd' => 'boolean',
            'pwd_specification' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'contact_number' => 'nullable|string|max:255',
            'email_address' => 'nullable|email|max:255',
            'is_employed' => 'boolean',
            'is_job_seeking' => 'boolean',
            'is_currently_enrolled' => 'boolean',
            'is_graduating' => 'boolean',
            'is_solo_parent' => 'boolean',
            'is_indigenous_group' => 'boolean',
            'is_registered_voter' => 'boolean',
            'voter_nationality' => 'nullable|string|max:255',
            'has_paymaya_account' => 'boolean',
            'preferred_mobile_number' => 'nullable|string|max:255',

            // Address data
            'addresses' => 'nullable|array',
            'addresses.*.type' => 'required_with:addresses|in:present,permanent,school',
            'addresses.*.address_line_1' => 'required_with:addresses|string|max:255',
            'addresses.*.address_line_2' => 'nullable|string|max:255',
            'addresses.*.barangay' => 'nullable|string|max:255',
            'addresses.*.district' => 'nullable|string|max:255',
            'addresses.*.city' => 'nullable|string|max:255',
            'addresses.*.province' => 'nullable|string|max:255',
            'addresses.*.region' => 'nullable|string|max:255',
            'addresses.*.zip_code' => 'nullable|string|max:20',

            // Family members data
            'family_members' => 'nullable|array',
            'family_members.*.relationship' => 'required_with:family_members|in:father,mother,guardian,sibling,spouse',
            'family_members.*.first_name' => 'required_with:family_members|string|max:255',
            'family_members.*.last_name' => 'required_with:family_members|string|max:255',
            'family_members.*.middle_name' => 'nullable|string|max:255',
            'family_members.*.extension_name' => 'nullable|string|max:255',
            'family_members.*.contact_number' => 'nullable|string|max:255',
            'family_members.*.occupation' => 'nullable|string|max:255',
            'family_members.*.monthly_income' => 'nullable|numeric|min:0',
            'family_members.*.is_alive' => 'boolean',
            'family_members.*.is_employed' => 'boolean',
            'family_members.*.is_ofw' => 'boolean',
            'family_members.*.is_pwd' => 'boolean',
            'family_members.*.pwd_specification' => 'nullable|string|max:255',

            // Financial information data
            'financial_information' => 'nullable|array',
            'financial_information.family_monthly_income_range' => [
                'nullable',
                'string',
                'in:"Below 5,000","5,000-10,000","10,000-15,000","15,000-20,000","20,000-30,000","30,000-50,000","Above 50,000"'
            ],
            'financial_information.monthly_income' => 'nullable|numeric|min:0',
            'financial_information.number_of_children' => 'nullable|integer|min:0',
            'financial_information.number_of_siblings' => 'nullable|integer|min:0',
            'financial_information.home_ownership_status' => 'nullable|in:owned,rented,living_with_relatives,boarding_house,informal_settlers,others',
            'financial_information.is_4ps_beneficiary' => 'boolean',

            // Emergency contacts data
            'emergency_contacts' => 'nullable|array',
            'emergency_contacts.*.full_name' => 'required_with:emergency_contacts|string|max:255',
            'emergency_contacts.*.contact_number' => 'required_with:emergency_contacts|string|max:255',
            'emergency_contacts.*.relationship' => 'required_with:emergency_contacts|string|max:255',
            'emergency_contacts.*.address' => 'nullable|string|max:255',
            'emergency_contacts.*.email' => 'nullable|email|max:255',
            'emergency_contacts.*.notes' => 'nullable|string',
            'emergency_contacts.*.is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Create student
            $studentData = $request->only([
                'citizen_id', 'user_id', 'student_id_number', 'first_name', 'last_name',
                'middle_name', 'extension_name', 'sex', 'civil_status', 'nationality',
                'birth_place', 'birth_date', 'is_pwd', 'pwd_specification', 'religion',
                'height_cm', 'weight_kg', 'contact_number', 'email_address', 'is_employed',
                'is_job_seeking', 'is_currently_enrolled', 'is_graduating', 'is_solo_parent',
                'is_indigenous_group', 'is_registered_voter', 'voter_nationality',
                'has_paymaya_account', 'preferred_mobile_number'
            ]);

            // Set user_id and citizen_id from authenticated user if not provided
            if ($request->has('auth_user')) {
                $authUser = $request->get('auth_user');
                if (!isset($studentData['user_id']) || !$studentData['user_id']) {
                    $studentData['user_id'] = $authUser['id'];
                }
                if (!isset($studentData['citizen_id']) || !$studentData['citizen_id'] || str_starts_with($studentData['citizen_id'], 'temp-citizen-')) {
                    $studentData['citizen_id'] = $authUser['citizen_id'];
                }
            }

            // Check if student with this citizen_id already exists
            $existingStudent = Student::where('citizen_id', $studentData['citizen_id'])->first();
            
            if ($existingStudent) {
                // Update existing student record instead of creating new one
                \Log::info("Updating existing student with citizen_id: {$studentData['citizen_id']}, ID: {$existingStudent->id}");
                $existingStudent->update($studentData);
                $student = $existingStudent;
            } else {
                // Create new student record
                \Log::info("Creating new student with citizen_id: {$studentData['citizen_id']}");
                $student = Student::create($studentData);
            }

            // Create addresses
            if ($request->has('addresses')) {
                foreach ($request->addresses as $addressData) {
                    $addressData['student_id'] = $student->id;
                    Address::create($addressData);
                }
            }

            // Create family members
            if ($request->has('family_members')) {
                foreach ($request->family_members as $familyData) {
                    $familyData['student_id'] = $student->id;
                    FamilyMember::create($familyData);
                }
            }

            // Create financial information
            if ($request->has('financial_information')) {
                $financialData = $request->financial_information;
                $financialData['student_id'] = $student->id;
                FinancialInformation::create($financialData);
            }

            // Create emergency contacts
            if ($request->has('emergency_contacts')) {
                foreach ($request->emergency_contacts as $emergencyData) {
                    $emergencyData['student_id'] = $student->id;
                    EmergencyContact::create($emergencyData);
                }
            }

            DB::commit();

            // Load relationships
            $student->load([
                'addresses',
                'familyMembers',
                'financialInformation',
                'emergencyContacts',
                'academicRecords',
                'currentAcademicRecord.school'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Student created successfully',
                'data' => $student
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create student', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified student
     */
    public function show(Student $student): JsonResponse
    {
        $student->load([
            'addresses',
            'familyMembers',
            'financialInformation',
            'emergencyContacts',
            'academicRecords.school',
            'currentAcademicRecord.school',
            'scholarshipApplications.category',
            'scholarshipApplications.subcategory',
            'scholarshipApplications.school',
            'documents.documentType'
        ]);

        return response()->json([
            'success' => true,
            'data' => $student
        ]);
    }

    /**
     * Update the specified student
     */
    public function update(Request $request, Student $student): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'sometimes|required|string|max:255',
            'last_name' => 'sometimes|required|string|max:255',
            'middle_name' => 'nullable|string|max:255',
            'extension_name' => 'nullable|string|max:255',
            'sex' => 'sometimes|required|in:Male,Female',
            'civil_status' => 'sometimes|required|in:Single,Married,Widowed,Divorced,Separated',
            'nationality' => 'nullable|string|max:255',
            'birth_place' => 'nullable|string|max:255',
            'birth_date' => 'nullable|date',
            'is_pwd' => 'boolean',
            'pwd_specification' => 'nullable|string|max:255',
            'religion' => 'nullable|string|max:255',
            'height_cm' => 'nullable|numeric|min:0|max:300',
            'weight_kg' => 'nullable|numeric|min:0|max:500',
            'contact_number' => 'nullable|string|max:255',
            'email_address' => 'nullable|email|max:255',
            'is_employed' => 'boolean',
            'is_job_seeking' => 'boolean',
            'is_currently_enrolled' => 'boolean',
            'is_graduating' => 'boolean',
            'is_solo_parent' => 'boolean',
            'is_indigenous_group' => 'boolean',
            'is_registered_voter' => 'boolean',
            'voter_nationality' => 'nullable|string|max:255',
            'has_paymaya_account' => 'boolean',
            'preferred_mobile_number' => 'nullable|string|max:255',
            'occupation' => 'nullable|string|max:255',

            // Address data
            'addresses' => 'nullable|array',
            'addresses.*.type' => 'required_with:addresses|in:present,permanent,school',
            'addresses.*.address_line_1' => 'required_with:addresses|string|max:255',
            'addresses.*.address_line_2' => 'nullable|string|max:255',
            'addresses.*.barangay' => 'nullable|string|max:255',
            'addresses.*.district' => 'nullable|string|max:255',
            'addresses.*.city' => 'nullable|string|max:255',
            'addresses.*.province' => 'nullable|string|max:255',
            'addresses.*.region' => 'nullable|string|max:255',
            'addresses.*.zip_code' => 'nullable|string|max:20',

            // Family members data
            'family_members' => 'nullable|array',
            'family_members.*.relationship' => 'required_with:family_members|in:father,mother,guardian,sibling,spouse',
            'family_members.*.first_name' => 'required_with:family_members|string|max:255',
            'family_members.*.last_name' => 'required_with:family_members|string|max:255',
            'family_members.*.middle_name' => 'nullable|string|max:255',
            'family_members.*.extension_name' => 'nullable|string|max:255',
            'family_members.*.contact_number' => 'nullable|string|max:255',
            'family_members.*.occupation' => 'nullable|string|max:255',
            'family_members.*.monthly_income' => 'nullable|numeric|min:0',
            'family_members.*.is_alive' => 'boolean',
            'family_members.*.is_employed' => 'boolean',
            'family_members.*.is_ofw' => 'boolean',
            'family_members.*.is_pwd' => 'boolean',
            'family_members.*.pwd_specification' => 'nullable|string|max:255',

            // Financial information data
            'financial_information' => 'nullable|array',
            'financial_information.family_monthly_income_range' => [
                'nullable',
                'string',
                'in:"Below 5,000","5,000-10,000","10,000-15,000","15,000-20,000","20,000-30,000","30,000-50,000","Above 50,000"'
            ],
            'financial_information.monthly_income' => 'nullable|numeric|min:0',
            'financial_information.number_of_children' => 'nullable|integer|min:0',
            'financial_information.number_of_siblings' => 'nullable|integer|min:0',
            'financial_information.siblings_currently_enrolled' => 'nullable|integer|min:0',
            'financial_information.home_ownership_status' => 'nullable|in:owned,rented,living_with_relatives,boarding_house,informal_settlers,others',
            'financial_information.is_4ps_beneficiary' => 'boolean',

            // Emergency contacts data
            'emergency_contacts' => 'nullable|array',
            'emergency_contacts.*.full_name' => 'required_with:emergency_contacts|string|max:255',
            'emergency_contacts.*.contact_number' => 'required_with:emergency_contacts|string|max:255',
            'emergency_contacts.*.relationship' => 'required_with:emergency_contacts|string|max:255',
            'emergency_contacts.*.address' => 'nullable|string|max:255',
            'emergency_contacts.*.email' => 'nullable|email|max:255',
            'emergency_contacts.*.notes' => 'nullable|string',
            'emergency_contacts.*.is_primary' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Update basic student information
            $student->update($request->only([
                'first_name', 'last_name', 'middle_name', 'extension_name', 'sex',
                'civil_status', 'nationality', 'birth_place', 'birth_date', 'is_pwd',
                'pwd_specification', 'religion', 'height_cm', 'weight_kg', 'contact_number',
                'email_address', 'is_employed', 'is_job_seeking', 'is_currently_enrolled',
                'is_graduating', 'is_solo_parent', 'is_indigenous_group', 'is_registered_voter',
                'voter_nationality', 'has_paymaya_account', 'preferred_mobile_number', 'occupation'
            ]));

            // Update addresses
            if ($request->has('addresses')) {
                // Delete existing addresses
                $student->addresses()->delete();
                
                // Create new addresses
                foreach ($request->addresses as $addressData) {
                    $addressData['student_id'] = $student->id;
                    Address::create($addressData);
                }
            }

            // Update family members
            if ($request->has('family_members')) {
                // Delete existing family members
                $student->familyMembers()->delete();
                
                // Create new family members
                foreach ($request->family_members as $familyData) {
                    $familyData['student_id'] = $student->id;
                    FamilyMember::create($familyData);
                }
            }

            // Update financial information
            if ($request->has('financial_information')) {
                $financialData = $request->financial_information;
                $financialData['student_id'] = $student->id;
                
                // Update or create financial information
                if ($student->financialInformation) {
                    $student->financialInformation()->update($financialData);
                } else {
                    FinancialInformation::create($financialData);
                }
            }

            // Update emergency contacts
            if ($request->has('emergency_contacts')) {
                // Delete existing emergency contacts
                $student->emergencyContacts()->delete();
                
                // Create new emergency contacts
                foreach ($request->emergency_contacts as $emergencyData) {
                    $emergencyData['student_id'] = $student->id;
                    EmergencyContact::create($emergencyData);
                }
            }

            DB::commit();

            $student->load([
                'addresses',
                'familyMembers',
                'financialInformation',
                'emergencyContacts',
                'academicRecords.school',
                'currentAcademicRecord.school'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Student updated successfully',
                'data' => $student
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to update student', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified student
     */
    public function destroy(Student $student): JsonResponse
    {
        try {
            $student->delete();

            return response()->json([
                'success' => true,
                'message' => 'Student deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete student',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Register student from approved scholarship application
     */
    public function registerFromScholarship(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'application_id' => 'required|integer|exists:scholarship_applications,id',
            'student_data' => 'required|array',
            'scholarship_data' => 'required|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $applicationId = $request->application_id;
            $studentData = $request->student_data;
            $scholarshipData = $request->scholarship_data;

            // Get the scholarship application with all related data
            $application = \App\Models\ScholarshipApplication::with([
                'student',
                'school',
                'category',
                'subcategory'
            ])->findOrFail($applicationId);

            // Check if student already exists for this application
            $existingStudent = Student::where('citizen_id', $application->student->citizen_id)->first();
            
            if ($existingStudent) {
                // Update existing student with scholarship information
                $existingStudent->update([
                    'is_currently_enrolled' => true,
                    'scholarship_status' => 'scholar',
                    'current_scholarship_id' => $applicationId,
                    'approved_amount' => $scholarshipData['approved_amount'] ?? 0,
                    'scholarship_start_date' => $scholarshipData['approved_at'] ?? now(),
                ]);

                // Create academic record if not exists
                $academicRecord = \App\Models\AcademicRecord::firstOrCreate([
                    'student_id' => $existingStudent->id,
                    'school_id' => $application->school_id,
                    'is_current' => true,
                ], [
                    'program' => $studentData['program'] ?? $application->student->program ?? '',
                    'year_level' => $studentData['year_level'] ?? $application->student->year_level ?? '',
                    'enrollment_date' => $studentData['enrollment_date'] ?? now(),
                    'gpa' => $studentData['gpa'] ?? 0,
                    'academic_status' => 'enrolled',
                ]);

                $student = $existingStudent;
            } else {
                // Create new student record
                $student = Student::create([
                    'citizen_id' => $application->student->citizen_id,
                    'user_id' => $application->student->user_id,
                    'student_id_number' => $this->generateStudentNumber(),
                    'first_name' => $studentData['first_name'] ?? $application->student->first_name,
                    'middle_name' => $studentData['middle_name'] ?? $application->student->middle_name,
                    'last_name' => $studentData['last_name'] ?? $application->student->last_name,
                    'extension_name' => $application->student->extension_name,
                    'sex' => $application->student->sex,
                    'civil_status' => $application->student->civil_status,
                    'nationality' => $application->student->nationality,
                    'birth_place' => $application->student->birth_place,
                    'birth_date' => $application->student->birth_date,
                    'is_pwd' => $application->student->is_pwd,
                    'pwd_specification' => $application->student->pwd_specification,
                    'religion' => $application->student->religion,
                    'height_cm' => $application->student->height_cm,
                    'weight_kg' => $application->student->weight_kg,
                    'contact_number' => $studentData['contact_number'] ?? $application->student->contact_number,
                    'email_address' => $studentData['email'] ?? $application->student->email_address,
                    'is_employed' => $application->student->is_employed,
                    'is_job_seeking' => $application->student->is_job_seeking,
                    'is_currently_enrolled' => true,
                    'is_graduating' => $application->student->is_graduating,
                    'is_solo_parent' => $application->student->is_solo_parent,
                    'is_indigenous_group' => $application->student->is_indigenous_group,
                    'is_registered_voter' => $application->student->is_registered_voter,
                    'voter_nationality' => $application->student->voter_nationality,
                    'has_paymaya_account' => $application->student->has_paymaya_account,
                    'preferred_mobile_number' => $application->student->preferred_mobile_number,
                    'scholarship_status' => 'scholar',
                    'current_scholarship_id' => $applicationId,
                    'approved_amount' => $scholarshipData['approved_amount'] ?? 0,
                    'scholarship_start_date' => $scholarshipData['approved_at'] ?? now(),
                ]);

                // Create academic record
                \App\Models\AcademicRecord::create([
                    'student_id' => $student->id,
                    'school_id' => $application->school_id,
                    'program' => $studentData['program'] ?? $application->student->program ?? '',
                    'year_level' => $studentData['year_level'] ?? $application->student->year_level ?? '',
                    'enrollment_date' => $studentData['enrollment_date'] ?? now(),
                    'gpa' => $studentData['gpa'] ?? 0,
                    'academic_status' => 'enrolled',
                    'is_current' => true,
                ]);

                // Copy addresses from application student
                if ($application->student->addresses) {
                    foreach ($application->student->addresses as $address) {
                        \App\Models\Address::create([
                            'student_id' => $student->id,
                            'type' => $address->type,
                            'address_line_1' => $address->address_line_1,
                            'address_line_2' => $address->address_line_2,
                            'barangay' => $address->barangay,
                            'district' => $address->district,
                            'city' => $address->city,
                            'province' => $address->province,
                            'region' => $address->region,
                            'zip_code' => $address->zip_code,
                        ]);
                    }
                }

                // Copy family members from application student
                if ($application->student->familyMembers) {
                    foreach ($application->student->familyMembers as $familyMember) {
                        \App\Models\FamilyMember::create([
                            'student_id' => $student->id,
                            'relationship' => $familyMember->relationship,
                            'first_name' => $familyMember->first_name,
                            'last_name' => $familyMember->last_name,
                            'middle_name' => $familyMember->middle_name,
                            'extension_name' => $familyMember->extension_name,
                            'contact_number' => $familyMember->contact_number,
                            'occupation' => $familyMember->occupation,
                            'monthly_income' => $familyMember->monthly_income,
                            'is_alive' => $familyMember->is_alive,
                            'is_employed' => $familyMember->is_employed,
                            'is_ofw' => $familyMember->is_ofw,
                            'is_pwd' => $familyMember->is_pwd,
                            'pwd_specification' => $familyMember->pwd_specification,
                        ]);
                    }
                }

                // Copy financial information from application student
                if ($application->student->financialInformation) {
                    $financialInfo = $application->student->financialInformation;
                    \App\Models\FinancialInformation::create([
                        'student_id' => $student->id,
                        'family_monthly_income_range' => $financialInfo->family_monthly_income_range,
                        'monthly_income' => $financialInfo->monthly_income,
                        'number_of_children' => $financialInfo->number_of_children,
                        'number_of_siblings' => $financialInfo->number_of_siblings,
                        'siblings_currently_enrolled' => $financialInfo->siblings_currently_enrolled,
                        'home_ownership_status' => $financialInfo->home_ownership_status,
                        'is_4ps_beneficiary' => $financialInfo->is_4ps_beneficiary,
                    ]);
                }

                // Copy emergency contacts from application student
                if ($application->student->emergencyContacts) {
                    foreach ($application->student->emergencyContacts as $emergencyContact) {
                        \App\Models\EmergencyContact::create([
                            'student_id' => $student->id,
                            'full_name' => $emergencyContact->full_name,
                            'contact_number' => $emergencyContact->contact_number,
                            'relationship' => $emergencyContact->relationship,
                            'address' => $emergencyContact->address,
                            'email' => $emergencyContact->email,
                            'notes' => $emergencyContact->notes,
                            'is_primary' => $emergencyContact->is_primary,
                        ]);
                    }
                }
            }

            // Create scholarship record
            \App\Models\ScholarshipRecord::create([
                'student_id' => $student->id,
                'application_id' => $applicationId,
                'scholarship_type' => $application->category->name ?? 'Scholarship',
                'subcategory' => $application->subcategory->name ?? '',
                'approved_amount' => $scholarshipData['approved_amount'] ?? 0,
                'start_date' => $scholarshipData['approved_at'] ?? now(),
                'status' => 'active',
                'approved_by' => $scholarshipData['approved_by'] ?? null,
            ]);

            DB::commit();

            // Load relationships
            $student->load([
                'addresses',
                'familyMembers',
                'financialInformation',
                'emergencyContacts',
                'academicRecords.school',
                'currentAcademicRecord.school',
                'scholarshipRecords'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Student registered successfully from scholarship approval',
                'data' => $student
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to register student from scholarship', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'application_id' => $request->application_id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to register student from scholarship',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check if student exists for application
     */
    public function checkByApplication($applicationId): JsonResponse
    {
        try {
            $application = \App\Models\ScholarshipApplication::findOrFail($applicationId);
            $student = Student::where('citizen_id', $application->student->citizen_id)->first();
            
            return response()->json([
                'success' => true,
                'exists' => $student !== null,
                'student_id' => $student ? $student->id : null
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to check student existence',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student by application ID
     */
    public function getByApplication($applicationId): JsonResponse
    {
        try {
            $application = \App\Models\ScholarshipApplication::findOrFail($applicationId);
            $student = Student::where('citizen_id', $application->student->citizen_id)
                ->with([
                    'addresses',
                    'familyMembers',
                    'financialInformation',
                    'emergencyContacts',
                    'academicRecords.school',
                    'currentAcademicRecord.school',
                    'scholarshipRecords'
                ])
                ->first();
            
            if (!$student) {
                return response()->json([
                    'success' => false,
                    'message' => 'Student not found for this application'
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $student
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get student by application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate student number
     */
    private function generateStudentNumber(): string
    {
        $year = date('Y');
        $random = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        return "GSM{$year}{$random}";
    }
}
