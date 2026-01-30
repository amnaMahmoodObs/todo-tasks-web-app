# Quickstart Guide: Task Management Feature

**Feature Branch**: `002-task-management`
**Date**: 2026-01-30
**Purpose**: Manual testing procedures and validation checklist

## Prerequisites

Before testing task management, ensure:

- ✅ Frontend running on `http://localhost:3000`
- ✅ Backend running on `http://localhost:8000`
- ✅ Neon PostgreSQL database connected
- ✅ Better Auth configured with shared secret
- ✅ `tasks` table created in database

### Environment Setup

**Backend** (`.env` in `backend/`):
```bash
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-here
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env.local` in `frontend/`):
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key-min-32-chars-here  # MUST match backend
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
NODE_ENV=development
```

### Start Services

```bash
# Terminal 1: Backend
cd backend
uvicorn src.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev

# Verify
curl http://localhost:8000/docs  # FastAPI Swagger UI
open http://localhost:3000        # Next.js app
```

---

## Testing Workflow

### Phase 1: User Setup (Prerequisites)

**Goal**: Create test users with authentication

**Steps**:

1. **Create Test User 1**:
   - Open `http://localhost:3000/signup`
   - Email: `user1@test.com`
   - Password: `testpass123`
   - Click "Sign Up"
   - ✅ Verify redirect to login page

2. **Login as User 1**:
   - Open `http://localhost:3000/login`
   - Email: `user1@test.com`
   - Password: `testpass123`
   - Click "Log In"
   - ✅ Verify redirect to dashboard

3. **Create Test User 2** (for isolation testing):
   - Log out
   - Repeat signup process with `user2@test.com` / `testpass123`

**Expected State**:
- Two users exist in database
- Can log in as either user
- JWT tokens issued on login

---

### Phase 2: Create Tasks (Priority P1 - User Story 1)

**Goal**: Test task creation functionality

#### Test 2.1: Create task with title only

**Steps**:
1. Log in as `user1@test.com`
2. Navigate to dashboard/tasks page
3. Click "Create Task" or "Add Task" button
4. Enter title: `"Buy groceries"`
5. Leave description empty
6. Click "Save" or "Create"

**Expected Results**:
- ✅ Task appears in task list immediately
- ✅ Task shows title "Buy groceries"
- ✅ Task has no description displayed
- ✅ Task is marked as incomplete (unchecked)
- ✅ Task has current timestamp
- ✅ Response time < 2 seconds (SC-001)

#### Test 2.2: Create task with title and description

**Steps**:
1. Click "Create Task" again
2. Enter title: `"Finish project"`
3. Enter description: `"Complete API docs and README"`
4. Click "Save"

**Expected Results**:
- ✅ Task appears with both title and description
- ✅ Description is visible when viewing task details
- ✅ Task is incomplete by default

#### Test 2.3: Validation - Empty title

**Steps**:
1. Click "Create Task"
2. Leave title field empty
3. Enter description: `"This should fail"`
4. Click "Save"

**Expected Results**:
- ✅ Error message displayed: "Title is required"
- ✅ Task is NOT created
- ✅ User remains on form
- ✅ Description input is preserved

#### Test 2.4: Validation - Title too long

**Steps**:
1. Click "Create Task"
2. Enter title with 201 characters (e.g., 201 'a's)
3. Click "Save"

**Expected Results**:
- ✅ Error message: "Title must be 200 characters or less"
- ✅ Task is NOT created
- ✅ Character count indicator shows 201/200 (if implemented)

#### Test 2.5: Validation - Description too long

**Steps**:
1. Click "Create Task"
2. Enter valid title: `"Test task"`
3. Enter description with 1001 characters
4. Click "Save"

**Expected Results**:
- ✅ Error message: "Description must be 1000 characters or less"
- ✅ Task is NOT created

#### Test 2.6: Edge case - Maximum length title

**Steps**:
1. Create task with exactly 200 character title
2. Save

**Expected Results**:
- ✅ Task created successfully
- ✅ Full title displayed without truncation

---

### Phase 3: View Tasks (Priority P2 - User Story 2)

**Goal**: Test task list display and data isolation

#### Test 3.1: View own tasks

**Steps**:
1. Ensure logged in as `user1@test.com`
2. Navigate to tasks page

**Expected Results**:
- ✅ All tasks created by user1 are displayed
- ✅ Tasks show title, completion status, timestamps
- ✅ Tasks ordered by creation date (newest first)
- ✅ Page loads in < 1 second with up to 100 tasks (SC-002)

#### Test 3.2: Empty task list

**Steps**:
1. Create new user `user3@test.com`
2. Log in as user3 (no tasks created yet)
3. Navigate to tasks page

**Expected Results**:
- ✅ Message displayed: "No tasks yet. Create your first task!"
- ✅ No tasks shown in list
- ✅ No errors or crashes

#### Test 3.3: Data isolation - User cannot see other users' tasks

**Steps**:
1. Ensure user1 has created tasks
2. Log out
3. Log in as `user2@test.com`
4. Navigate to tasks page

**Expected Results**:
- ✅ User2 sees ONLY their own tasks (or empty list if none created)
- ✅ User1's tasks are NOT visible
- ✅ 100% data isolation enforced (SC-004)

#### Test 3.4: Task details displayed correctly

**Steps**:
1. View task list as user1
2. Find task with description

**Expected Results**:
- ✅ Title is displayed
- ✅ Description is displayed (if present)
- ✅ Completion status shown (checkbox/icon)
- ✅ Created timestamp visible
- ✅ Updated timestamp visible (if different from created)

---

### Phase 4: Mark Complete/Incomplete (Priority P3 - User Story 3)

**Goal**: Test toggling task completion status

#### Test 4.1: Mark task as complete

**Steps**:
1. Log in as user1
2. Find an incomplete task
3. Click "Mark Complete" button/checkbox

**Expected Results**:
- ✅ Task status changes to complete
- ✅ Visual indicator updated (e.g., strikethrough, checkmark)
- ✅ UI updates within 1 second (SC-003)
- ✅ Updated timestamp refreshed

#### Test 4.2: Mark task as incomplete

**Steps**:
1. Find a completed task
2. Click "Mark Incomplete" button/checkbox

**Expected Results**:
- ✅ Task status changes back to incomplete
- ✅ Visual indicator removed (unchecked)
- ✅ UI updates within 1 second

#### Test 4.3: Status persists across page refresh

**Steps**:
1. Mark a task as complete
2. Refresh the browser page (F5)

**Expected Results**:
- ✅ Task remains marked as complete
- ✅ Status persisted to database (SC-010)

#### Test 4.4: Multiple status toggles

**Steps**:
1. Toggle task complete → incomplete → complete → incomplete

**Expected Results**:
- ✅ Each toggle updates the status correctly
- ✅ No errors or race conditions
- ✅ Updated timestamp reflects latest change

---

### Phase 5: Update Task Details (Priority P4 - User Story 4)

**Goal**: Test editing task title and description

#### Test 5.1: Update task title

**Steps**:
1. Find a task
2. Click "Edit" button
3. Change title from `"Buy groceries"` to `"Buy groceries and supplies"`
4. Click "Save"

**Expected Results**:
- ✅ Updated title displayed in task list
- ✅ Updated timestamp refreshed
- ✅ Created timestamp unchanged
- ✅ Changes persist after page refresh

#### Test 5.2: Update task description

**Steps**:
1. Edit a task
2. Change description from `"Milk, eggs"` to `"Milk, eggs, bread, cheese"`
3. Save

**Expected Results**:
- ✅ Updated description displayed
- ✅ Updated timestamp refreshed

#### Test 5.3: Update both title and description

**Steps**:
1. Edit a task
2. Change both title and description
3. Save

**Expected Results**:
- ✅ Both fields updated
- ✅ Single updated timestamp (not two separate updates)

#### Test 5.4: Clear description

**Steps**:
1. Edit a task that has a description
2. Delete all text from description field
3. Save

**Expected Results**:
- ✅ Description removed (set to null)
- ✅ Task displays without description
- ✅ Title still visible

#### Test 5.5: Validation - Cannot clear title

**Steps**:
1. Edit a task
2. Delete entire title (make it empty)
3. Attempt to save

**Expected Results**:
- ✅ Error message: "Title is required"
- ✅ Changes NOT saved
- ✅ Original title preserved

#### Test 5.6: Validation - Title too long on update

**Steps**:
1. Edit a task
2. Change title to 201 characters
3. Attempt to save

**Expected Results**:
- ✅ Error message: "Title must be 200 characters or less"
- ✅ Changes NOT saved

---

### Phase 6: Delete Task (Priority P5 - User Story 5)

**Goal**: Test permanent task deletion

#### Test 6.1: Delete task with confirmation

**Steps**:
1. Find a task
2. Click "Delete" button
3. Confirmation prompt appears: "Are you sure you want to delete this task?"
4. Click "Confirm"

**Expected Results**:
- ✅ Task removed from task list immediately
- ✅ Task does not reappear after page refresh
- ✅ Task permanently deleted from database (SC-008)

#### Test 6.2: Cancel deletion

**Steps**:
1. Click "Delete" on a task
2. Confirmation prompt appears
3. Click "Cancel"

**Expected Results**:
- ✅ Task remains in list
- ✅ Task NOT deleted
- ✅ No changes made

#### Test 6.3: Delete task and verify permanent removal

**Steps**:
1. Note the task ID (e.g., 5)
2. Delete the task
3. Refresh page
4. Attempt to access task directly via URL: `/api/{user_id}/tasks/5`

**Expected Results**:
- ✅ Task not found in UI
- ✅ API returns 404 Not Found
- ✅ Cannot be recovered (hard delete verified)

---

### Phase 7: Edge Cases & Error Handling

#### Test 7.1: Network error during task creation

**Steps**:
1. Stop backend server
2. Attempt to create a task
3. Submit form

**Expected Results**:
- ✅ Error message: "Unable to save task. Please check your connection and try again."
- ✅ Task NOT created
- ✅ Form data preserved
- ✅ No application crash

#### Test 7.2: Expired JWT token

**Steps**:
1. Manually expire JWT token (or wait for expiration)
2. Attempt to create/view/update/delete task

**Expected Results**:
- ✅ 401 Unauthorized response
- ✅ User redirected to login page
- ✅ Error message: "Session expired. Please log in again."

#### Test 7.3: Access task from different user (URL manipulation)

**Steps**:
1. Log in as user1
2. Create a task (note the task ID, e.g., 10)
3. Log out, log in as user2
4. Manually navigate to `/api/user1-uuid/tasks/10` (or frontend equivalent)

**Expected Results**:
- ✅ 403 Forbidden or 404 Not Found
- ✅ Error message: "Access denied" or "Task not found"
- ✅ Task details NOT exposed to user2
- ✅ Data isolation enforced

#### Test 7.4: Attempt to update non-existent task

**Steps**:
1. Try to update task with ID 99999 (doesn't exist)

**Expected Results**:
- ✅ 404 Not Found
- ✅ Error message: "Task not found"

#### Test 7.5: Concurrent updates (same user, different devices)

**Steps**:
1. Open app in two browser tabs (both logged in as user1)
2. In Tab 1: Update task title to "Version A"
3. In Tab 2: Update same task title to "Version B"
4. Refresh both tabs

**Expected Results**:
- ✅ Last write wins (whichever saved last)
- ✅ Both tabs show same final state after refresh
- ✅ No database corruption

---

### Phase 8: Performance Testing

#### Test 8.1: Large task list performance

**Steps**:
1. Create 100 tasks for user1 (can use API script)
2. Navigate to task list page
3. Measure load time

**Expected Results**:
- ✅ Page loads in < 1 second (SC-002)
- ✅ All tasks displayed correctly
- ✅ Scrolling is smooth
- ✅ No UI freezing or lag

**Script to create 100 tasks**:
```bash
# Save JWT token after login
TOKEN="your-jwt-token-here"
USER_ID="your-user-id-here"

for i in {1..100}; do
  curl -X POST "http://localhost:8000/api/${USER_ID}/tasks" \
    -H "Authorization: Bearer ${TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"title\": \"Test task $i\", \"description\": \"Task number $i for performance testing\"}"
done
```

#### Test 8.2: Concurrent task operations

**Steps**:
1. Create 10 tasks rapidly (click "Create" 10 times in quick succession)

**Expected Results**:
- ✅ All 10 tasks created successfully
- ✅ No duplicate tasks
- ✅ No errors or race conditions
- ✅ SC-009: 50+ concurrent operations handled (tested with API script)

---

## Validation Checklist

Use this checklist to verify all success criteria are met:

### ✅ Success Criteria Validation

- [ ] **SC-001**: Users can create a new task and see it appear in their list within 2 seconds under normal network conditions
- [ ] **SC-002**: Users can view their complete task list (up to 100 tasks) in under 1 second
- [ ] **SC-003**: Users can toggle a task's completion status and see the UI update within 1 second
- [ ] **SC-004**: 100% of task operations enforce data isolation (users can never access another user's tasks)
- [ ] **SC-005**: 95% of task creation attempts with valid input succeed on the first try without errors
- [ ] **SC-006**: All task CRUD operations return appropriate HTTP status codes (success, validation error, not found, etc.)
- [ ] **SC-007**: Task title and description validation prevents 100% of invalid submissions (empty titles, exceeding character limits)
- [ ] **SC-008**: Users can successfully complete the core workflow (create task → view list → mark complete → delete) without encountering errors
- [ ] **SC-009**: The system handles at least 50 concurrent task operations (create, update, delete) without degradation
- [ ] **SC-010**: Task data persists correctly across browser refreshes and user sessions (100% persistence reliability)

### ✅ Functional Requirements Validation

- [ ] **FR-001**: System allows authenticated users to create new tasks with a required title field
- [ ] **FR-002**: System validates that task titles are not empty and do not exceed 200 characters
- [ ] **FR-003**: System allows users to optionally provide a description when creating a task
- [ ] **FR-004**: System validates that task descriptions do not exceed 1000 characters
- [ ] **FR-005**: System sets new tasks to incomplete status by default
- [ ] **FR-006**: System displays a list of all tasks belonging to the authenticated user
- [ ] **FR-007**: System enforces data isolation so users can only view their own tasks
- [ ] **FR-008**: System displays each task's title, description (if present), completion status, and timestamps
- [ ] **FR-009**: System allows users to mark tasks as complete or incomplete (toggle status)
- [ ] **FR-010**: System persists task completion status changes immediately
- [ ] **FR-011**: System allows users to edit the title and description of their existing tasks
- [ ] **FR-012**: System validates edited titles using the same rules as new tasks (required, max 200 characters)
- [ ] **FR-013**: System allows users to delete their tasks permanently
- [ ] **FR-014**: System requires confirmation before deleting a task to prevent accidental deletion
- [ ] **FR-015**: System stores the creation timestamp for each task
- [ ] **FR-016**: System stores and updates the last modified timestamp whenever a task is edited
- [ ] **FR-017**: System associates each task with the user who created it (user_id foreign key)
- [ ] **FR-018**: System prevents users from accessing, modifying, or deleting tasks owned by other users
- [ ] **FR-019**: System displays appropriate error messages for validation failures and network errors
- [ ] **FR-020**: System returns appropriate HTTP status codes for all task operations

---

## API Testing (Alternative/Supplemental)

For backend testing without frontend, use these curl commands:

### Create Task
```bash
curl -X POST "http://localhost:8000/api/${USER_ID}/tasks" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

### List Tasks
```bash
curl "http://localhost:8000/api/${USER_ID}/tasks" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Get Task by ID
```bash
curl "http://localhost:8000/api/${USER_ID}/tasks/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Update Task
```bash
curl -X PUT "http://localhost:8000/api/${USER_ID}/tasks/1" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries and supplies", "description": "Milk, eggs, bread, cheese"}'
```

### Toggle Completion
```bash
curl -X PATCH "http://localhost:8000/api/${USER_ID}/tasks/1/complete" \
  -H "Authorization: Bearer ${TOKEN}"
```

### Delete Task
```bash
curl -X DELETE "http://localhost:8000/api/${USER_ID}/tasks/1" \
  -H "Authorization: Bearer ${TOKEN}"
```

---

## Debugging Tips

### Common Issues

**Issue**: 401 Unauthorized on all API requests
**Solution**: Verify JWT token is valid and included in Authorization header

**Issue**: 403 Forbidden when accessing tasks
**Solution**: Ensure user_id in URL matches user_id in JWT token

**Issue**: Task not appearing after creation
**Solution**: Check browser console for errors; verify database connection

**Issue**: CORS errors
**Solution**: Verify backend CORS configuration includes frontend URL

### Database Inspection

```sql
-- View all tasks for a user
SELECT * FROM tasks WHERE user_id = 'your-user-id-here' ORDER BY created_at DESC;

-- Count tasks per user
SELECT user_id, COUNT(*) as task_count FROM tasks GROUP BY user_id;

-- View tasks with details
SELECT t.id, t.title, t.completed, u.email
FROM tasks t
JOIN users u ON t.user_id = u.id
ORDER BY t.created_at DESC;
```

---

## Test Completion Sign-off

**Tester**: ___________________________
**Date**: ___________________________
**Result**: [ ] PASS  [ ] FAIL
**Notes**: ___________________________

---

**Quickstart Guide Version**: 1.0
**Last Updated**: 2026-01-30
**Next Steps**: After all tests pass, proceed to `/sp.tasks` to generate implementation task breakdown
