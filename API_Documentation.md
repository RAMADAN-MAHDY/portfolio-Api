# API Documentation for PDF Management System

This document provides a guide for frontend developers to interact with the PDF management system API. It includes details on available endpoints, request formats, and example responses.

## Base URL

The base URL for all API endpoints is: `http://localhost:4000/api` (or your deployed backend URL).

---

## 1. Category Endpoints

### 1.1 Add New Category

-   **Endpoint**: `POST /categories`
-   **Description**: Adds a new category to the system.
-   **Request Body (JSON)**:
    ```json
    {
      "name": "اسم الفئة",
      "description": "وصف اختياري للفئة"
    }
    ```
-   **Example Request (JavaScript Fetch)**:
    ```javascript
    fetch('http://localhost:4000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'البرمجة',
        description: 'كتب وموارد حول لغات البرمجة المختلفة.'
      }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (201 Created)**:
    ```json
    {
      "message": "تمت إضافة الفئة بنجاح.",
      "category": {
        "name": "البرمجة",
        "description": "كتب وموارد حول لغات البرمجة المختلفة.",
        "_id": "65f2a1b2c3d4e5f6a7b8c9d0",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z",
        "__v": 0
      }
    }
    ```
-   **Example Error Response (400 Bad Request - Duplicate Name)**:
    ```json
    {
      "message": "اسم الفئة موجود بالفعل."
    }
    ```
-   **Example Error Response (400 Bad Request - Validation Error)**:
    ```json
    {
      "message": "اسم الفئة مطلوب."
    }
    ```

### 1.2 Get All Categories

-   **Endpoint**: `GET /categories`
-   **Description**: Retrieves a list of all categories.
-   **Example Request (JavaScript Fetch)**:
    ```javascript
    fetch('http://localhost:4000/api/categories')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (200 OK)**:
    ```json
    [
      {
        "_id": "65f2a1b2c3d4e5f6a7b8c9d0",
        "name": "البرمجة",
        "description": "كتب وموارد حول لغات البرمجة المختلفة.",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:00:00.000Z",
        "__v": 0
      },
      {
        "_id": "65f2a1b2c3d4e5f6a7b8c9d1",
        "name": "التاريخ",
        "description": "كتب حول الأحداث التاريخية.",
        "createdAt": "2023-10-27T10:05:00.000Z",
        "updatedAt": "2023-10-27T10:05:00.000Z",
        "__v": 0
      }
    ]
    ```
-   **Example Error Response (500 Internal Server Error)**:
    ```json
    {
      "message": "Internal Server Error"
    }
    ```

### 1.3 Update Category

-   **Endpoint**: `PUT /categories/:id`
-   **Description**: Updates an existing category by its ID.
-   **URL Parameters**:
    -   `id` (string): The ID of the category to update.
-   **Request Body (JSON)**:
    ```json
    {
      "name": "اسم الفئة الجديد",
      "description": "وصف الفئة الجديد"
    }
    ```
-   **Example Request (JavaScript Fetch)**:
    ```javascript
    fetch('http://localhost:4000/api/categories/65f2a1b2c3d4e5f6a7b8c9d0', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'تطوير الويب',
        description: 'كتب وموارد حول تطوير تطبيقات الويب.'
      }),
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (200 OK)**:
    ```json
    {
      "message": "تم تحديث الفئة بنجاح.",
      "category": {
        "_id": "65f2a1b2c3d4e5f6a7b8c9d0",
        "name": "تطوير الويب",
        "description": "كتب وموارد حول تطوير تطبيقات الويب.",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:15:00.000Z",
        "__v": 0
      }
    }
    ```
-   **Example Error Response (404 Not Found)**:
    ```json
    {
      "message": "الفئة غير موجودة."
    }
    ```
-   **Example Error Response (400 Bad Request - Duplicate Name)**:
    ```json
    {
      "message": "اسم الفئة موجود بالفعل."
    }
    ```

### 1.4 Delete Category

-   **Endpoint**: `DELETE /categories/:id`
-   **Description**: Deletes a category by its ID.
-   **URL Parameters**:
    -   `id` (string): The ID of the category to delete.
-   **Example Request (JavaScript Fetch)**:
    ```javascript
    fetch('http://localhost:4000/api/categories/65f2a1b2c3d4e5f6a7b8c9d0', {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (200 OK)**:
    ```json
    {
      "message": "تم حذف الفئة بنجاح."
    }
    ```
-   **Example Error Response (404 Not Found)**:
    ```json
    {
      "message": "الفئة غير موجودة."
    }
    ```

---

## 2. PDF Endpoints

### 2.1 Add New PDF

-   **Endpoint**: `POST /pdfs`
-   **Description**: Uploads a new PDF file (and optional cover image) to R2 and saves its metadata to the database.
-   **Request Body (multipart/form-data)**:
    -   `pdfFile` (File, required): ملف PDF المراد رفعه.
    -   `coverImage` (File, optional): صورة الغلاف للكتاب.
    -   `fileName` (string, required): اسم ملف PDF.
    -   `description` (string, optional): وصف لملف PDF.
    -   `category` (string, required): معرف الفئة التي ينتمي إليها ملف PDF.
    -   `author` (string, required): مؤلف ملف PDF.
    -   `isPublished` (string, optional): ما إذا كان ملف PDF منشورًا (أرسل كـ "true" أو "false" كنص).
-   **Example Request (JavaScript Fetch with FormData)**:
    ```javascript
    const formData = new FormData();
    formData.append('pdfFile', yourPdfFileObject); // 'yourPdfFileObject' يجب أن يكون كائن File
    formData.append('coverImage', yourCoverImageFileObject); // 'yourCoverImageFileObject' كائن File (اختياري)
    formData.append('fileName', 'مقدمة في بايثون');
    formData.append('description', 'كتاب تمهيدي لتعلم لغة بايثون.');
    formData.append('category', '65f2a1b2c3d4e5f6a7b8c9d0'); // استبدل بمعرف فئة حقيقي
    formData.append('author', 'أحمد محمد');
    formData.append('isPublished', 'true');

    fetch('http://localhost:4000/api/pdfs', {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (201 Created)**:
    ```json
    {
      "message": "تمت إضافة ملف PDF بنجاح.",
      "file": {
        "fileName": "مقدمة في بايثون",
        "description": "كتاب تمهيدي لتعلم لغة بايثون.",
        "fileKey": "pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
        "fileUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
        "fileSize": 1234567,
        "category": "65f2a1b2c3d4e5f6a7b8c9d0",
        "author": "أحمد محمد",
        "isPublished": true,
        "coverImageKey": "covers/1779748801063-987654321-cover.jpg",
        "coverImageUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/covers/1779748801063-987654321-cover.jpg",
        "_id": "65f2a1b2c3d4e5f6a7b8c9d2",
        "uploadDate": "2023-10-27T10:30:00.000Z",
        "createdAt": "2023-10-27T10:30:00.000Z",
        "updatedAt": "2023-10-27T10:30:00.000Z",
        "__v": 0
      }
    }
    ```
-   **Example Error Response (400 Bad Request - No File)**:
    ```json
    {
      "message": "لم يتم رفع أي ملف PDF. يرجى التأكد من اختيار ملف PDF."
    }
    ```
-   **Example Error Response (400 Bad Request - Invalid File Type)**:
    ```json
    {
      "message": "نوع الملف غير مدعوم. يرجى رفع ملف PDF أو صورة صالحة."
    }
    ```
-   **Example Error Response (404 Not Found - Category)**:
    ```json
    {
      "message": "الفئة المحددة غير موجودة."
    }
    ```
-   **Example Error Response (400 Bad Request - Validation Error)**:
    ```json
    {
      "message": "خطأ في التحقق من الصحة:",
      "errors": ["اسم الملف مطلوب."]
    }
    ```

### 2.2 Update PDF Metadata

-   **Endpoint**: `PUT /pdfs/:id`
-   **Description**: Updates the metadata of an existing PDF file by its ID. Can also upload a new cover image.
-   **URL Parameters**:
    -   `id` (string): The ID of the PDF file to update.
-   **Request Body (multipart/form-data)**:
    -   `coverImage` (File, optional): صورة غلاف جديدة للكتاب.
    -   `fileName` (string, optional): اسم ملف PDF الجديد.
    -   `description` (string, optional): وصف محدث للملف.
    -   `category` (string, optional): معرف الفئة المحدثة.
    -   `author` (string, optional): المؤلف المحدث.
    -   `isPublished` (boolean, optional): حالة النشر المحدثة.
-   **Example Request (JavaScript Fetch with FormData)**:
    ```javascript
    const formData = new FormData();
    formData.append('coverImage', yourNewCoverImageFileObject); // صورة غلاف جديدة (اختيارية)
    formData.append('fileName', 'مقدمة في بايثون (إصدار 2)');
    formData.append('description', 'نسخة محدثة من الكتاب التمهيدي لتعلم لغة بايثون.');
    formData.append('category', '65f2a1b2c3d4e5f6a7b8c9d0');
    formData.append('author', 'أحمد محمد');
    formData.append('isPublished', 'true');

    fetch('http://localhost:4000/api/pdfs/65f2a1b2c3d4e5f6a7b8c9d2', {
      method: 'PUT',
      body: formData,
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (200 OK)**:
    ```json
    {
      "message": "تم تحديث بيانات ملف PDF بنجاح.",
      "file": {
        "_id": "65f2a1b2c3d4e5f6a7b8c9d2",
        "fileName": "مقدمة في بايثون (إصدار 2)",
        "description": "نسخة محدثة من الكتاب التمهيدي لتعلم لغة بايثون.",
        "fileKey": "pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
        "fileUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
        "fileSize": 1234567,
        "category": "65f2a1b2c3d4e5f6a7b8c9d0",
        "author": "أحمد محمد",
        "isPublished": true,
        "coverImageKey": "covers/1779748901064-456789123-new-cover.jpg",
        "coverImageUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/covers/1779748901064-456789123-new-cover.jpg",
        "uploadDate": "2023-10-27T10:30:00.000Z",
        "createdAt": "2023-10-27T10:30:00.000Z",
        "updatedAt": "2023-10-27T10:45:00.000Z",
        "__v": 0
      }
    }
    ```
-   **Example Error Response (404 Not Found - PDF)**:
    ```json
    {
      "message": "ملف PDF غير موجود."
    }
    ```
-   **Example Error Response (404 Not Found - Category)**:
    ```json
    {
      "message": "الفئة المحددة غير موجودة."
    }
    ```

### 2.3 Delete PDF

-   **Endpoint**: `DELETE /pdfs/:id`
-   **Description**: Deletes a PDF file and its cover image (if exists) from R2 storage and its record from the database.
-   **URL Parameters**:
    -   `id` (string): The ID of the PDF file to delete.
-   **Example Request (JavaScript Fetch)**:
    ```javascript
    fetch('http://localhost:4000/api/pdfs/65f2a1b2c3d4e5f6a7b8c9d2', {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (200 OK)**:
    ```json
    {
      "message": "تم حذف ملف PDF بنجاح."
    }
    ```
-   **Example Error Response (404 Not Found)**:
    ```json
    {
      "message": "ملف PDF غير موجود."
    }
    ```

### 2.4 Get PDF Details

-   **Endpoint**: `GET /pdfs/:id`
-   **Description**: Retrieves the details of a specific PDF file by its ID.
-   **URL Parameters**:
    -   `id` (string): The ID of the PDF file.
-   **Example Request (JavaScript Fetch)**:
    ```javascript
    fetch('http://localhost:4000/api/pdfs/65f2a1b2c3d4e5f6a7b8c9d2')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (200 OK)**:
    ```json
    {
      "_id": "65f2a1b2c3d4e5f6a7b8c9d2",
      "fileName": "مقدمة في بايثون (إصدار 2)",
      "description": "نسخة محدثة من الكتاب التمهيدي لتعلم لغة بايثون.",
      "fileKey": "pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
      "fileUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
      "fileSize": 1234567,
      "category": {
        "_id": "65f2a1b2c3d4e5f6a7b8c9d0",
        "name": "تطوير الويب",
        "description": "كتب وموارد حول تطوير تطبيقات الويب.",
        "createdAt": "2023-10-27T10:00:00.000Z",
        "updatedAt": "2023-10-27T10:15:00.000Z",
        "__v": 0
      },
      "author": "أحمد محمد",
      "isPublished": true,
      "coverImageKey": "covers/1779748801063-987654321-cover.jpg",
      "coverImageUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/covers/1779748801063-987654321-cover.jpg",
      "uploadDate": "2023-10-27T10:30:00.000Z",
      "createdAt": "2023-10-27T10:30:00.000Z",
      "updatedAt": "2023-10-27T10:45:00.000Z",
      "__v": 0
    }
    ```
-   **Example Error Response (404 Not Found)**:
    ```json
    {
      "message": "ملف PDF غير موجود."
    }
    ```

### 2.5 Get All PDFs

-   **Endpoint**: `GET /pdfs`
-   **Description**: Retrieves a paginated list of all PDF files. Supports searching and filtering by category.
-   **Query Parameters**:
    -   `page` (number, optional): The page number to retrieve (default: 1).
    -   `limit` (number, optional): The number of items per page (default: 10, max: 10).
    -   `search` (string, optional): A search term to filter by `fileName`, `description`, or `author`.
    -   `category` (string, optional): The ID or name of the category to filter by.
-   **Example Request (JavaScript Fetch - All PDFs, page 1, limit 5)**:
    ```javascript
    fetch('http://localhost:4000/api/pdfs?page=1&limit=5')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Request (JavaScript Fetch - Search for "بايثون")**:
    ```javascript
    fetch('http://localhost:4000/api/pdfs?search=بايثون')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Request (JavaScript Fetch - Filter by Category ID)**:
    ```javascript
    fetch('http://localhost:4000/api/pdfs?category=65f2a1b2c3d4e5f6a7b8c9d0')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (200 OK)**:
    ```json
    {
      "files": [
        {
          "_id": "65f2a1b2c3d4e5f6a7b8c9d2",
          "fileName": "مقدمة في بايثون (إصدار 2)",
          "description": "نسخة محدثة من الكتاب التمهيدي لتعلم لغة بايثون.",
          "fileKey": "pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
          "fileUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
          "fileSize": 1234567,
          "category": {
            "_id": "65f2a1b2c3d4e5f6a7b8c9d0",
            "name": "تطوير الويب",
            "description": "كتب وموارد حول تطوير تطبيقات الويب.",
            "createdAt": "2023-10-27T10:00:00.000Z",
            "updatedAt": "2023-10-27T10:15:00.000Z",
            "__v": 0
          },
          "author": "أحمد محمد",
          "isPublished": true,
          "coverImageKey": "covers/1779748801063-987654321-cover.jpg",
          "coverImageUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/covers/1779748801063-987654321-cover.jpg",
          "uploadDate": "2023-10-27T10:30:00.000Z",
          "createdAt": "2023-10-27T10:30:00.000Z",
          "updatedAt": "2023-10-27T10:45:00.000Z",
          "__v": 0
        }
      ],
      "currentPage": 1,
      "totalPages": 1,
      "totalFiles": 1
    }
    ```
-   **Example Error Response (404 Not Found - Category)**:
    ```json
    {
      "message": "الفئة المحددة غير موجودة."
    }
    ```

### 2.6 Get PDFs by Category

-   **Endpoint**: `GET /pdfs/category/:categoryId`
-   **Description**: Retrieves a paginated list of PDF files belonging to a specific category.
-   **URL Parameters**:
    -   `categoryId` (string): The ID of the category.
-   **Query Parameters**:
    -   `page` (number, optional): The page number to retrieve (default: 1).
    -   `limit` (number, optional): The number of items per page (default: 10, max: 10).
-   **Example Request (JavaScript Fetch)**:
    ```javascript
    fetch('http://localhost:4000/api/pdfs/category/65f2a1b2c3d4e5f6a7b8c9d0?page=1&limit=5')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (200 OK)**:
    ```json
    {
      "files": [
        {
          "_id": "65f2a1b2c3d4e5f6a7b8c9d2",
          "fileName": "مقدمة في بايثون (إصدار 2)",
          "description": "نسخة محدثة من الكتاب التمهيدي لتعلم لغة بايثون.",
          "fileKey": "pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
          "fileUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/pdfs/1779748801062-123456789-مقدمة-في-بايثون.pdf",
          "fileSize": 1234567,
          "category": {
            "_id": "65f2a1b2c3d4e5f6a7b8c9d0",
            "name": "تطوير الويب",
            "description": "كتب وموارد حول تطوير تطبيقات الويب.",
            "createdAt": "2023-10-27T10:00:00.000Z",
            "updatedAt": "2023-10-27T10:15:00.000Z",
            "__v": 0
          },
          "author": "أحمد محمد",
          "isPublished": true,
          "coverImageKey": "covers/1779748801063-987654321-cover.jpg",
          "coverImageUrl": "https://pub-ab6252bd54b747f1a39db1d12c0cb206.r2.dev/covers/1779748801063-987654321-cover.jpg",
          "uploadDate": "2023-10-27T10:30:00.000Z",
          "createdAt": "2023-10-27T10:30:00.000Z",
          "updatedAt": "2023-10-27T10:45:00.000Z",
          "__v": 0
        }
      ],
      "currentPage": 1,
      "totalPages": 1,
      "totalFiles": 1
    }
    ```
-   **Example Error Response (404 Not Found - Category)**:
    ```json
    {
      "message": "الفئة المحددة غير موجودة."
    }
    ```

### 2.7 Download PDF

-   **Endpoint**: `GET /pdfs/download/:id`
-   **Description**: Redirects to the direct download URL of a PDF file from R2 storage.
-   **URL Parameters**:
    -   `id` (string): The ID of the PDF file to download.
-   **Example Request (JavaScript Fetch)**:
    ```javascript
    fetch('http://localhost:4000/api/pdfs/download/65f2a1b2c3d4e5f6a7b8c9d2')
    .then(response => {
      if (response.ok) {
        // The browser will automatically follow the redirect to the file URL
        console.log('Redirecting to PDF download...');
      } else {
        return response.json().then(errorData => console.error('Error:', errorData));
      }
    })
    .catch(error => console.error('Error:', error));
    ```
-   **Example Success Response (302 Found - Redirect)**:
    -   The browser will be redirected to the `fileUrl` stored in R2.
-   **Example Error Response (404 Not Found)**:
    ```json
    {
      "message": "ملف PDF غير موجود."
    }
    ```

---