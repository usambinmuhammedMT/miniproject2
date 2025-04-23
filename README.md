
 
# FoodieBites - Food Ordering System

A full-stack food ordering application with user and admin interfaces.


## Features

- **User Features**: Browse menu, add items to cart, place orders, view order history and invoices
- **Admin Features**: Manage food items, categories, update order status, view detailed reports
- **Payment Processing**: Simulated payment system with multiple payment methods
- **Invoicing**: Automatic invoice generation for orders


## Technology Stack

### Frontend
- React.js
- Tailwind CSS
- Framer Motion (animations)

### Backend
- Django & Django REST Framework
- SQLite (development) / PostgreSQL (production)
- Python 3.x

## Setup Instructions

### Prerequisites
- Python 3.x
- Node.js and npm
- Git

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/AmitStredz/Miniproject.git
   cd miniproject/backend
   ```

2. **Create and activate a virtual environment**
   ```bash
   # On macOS/Linux
   python3 -m venv venv
   source venv/bin/activate

   # On Windows
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Apply migrations**
   ```bash
   python manage.py migrate
   ```

5. **Create a superuser (for admin access)**
   ```bash
   python manage.py createsuperuser
   ```

6. **Run the development server**
   ```bash
   python manage.py runserver
   ```
   The backend API will be available at http://localhost:8000/

### Frontend Setup

1. **Navigate to the project root**
   ```bash
   cd miniproject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   The application will be available at http://localhost:3000/

## API Endpoints

### Authentication
- `POST /api/login/` - User login
- `POST /api/register/` - User registration

### Categories
- `GET /api/categories/` - List all categories
- `POST /api/categories/` - Create a new category (admin only)
- `GET /api/categories/:id/` - Get category details
- `PUT /api/categories/:id/` - Update a category (admin only)
- `DELETE /api/categories/:id/` - Delete a category (admin only)

### Food Items
- `GET /api/food-items/` - List all food items
- `POST /api/food-items/` - Create a new food item (admin only)
- `GET /api/food-items/:id/` - Get food item details
- `PUT /api/food-items/:id/` - Update a food item (admin only)
- `DELETE /api/food-items/:id/` - Delete a food item (admin only)

### Cart
- `GET /api/carts/:id/` - Get cart details
- `POST /api/carts/:id/add_item/` - Add item to cart
- `POST /api/carts/:id/remove_item/` - Remove item from cart
- `POST /api/carts/:id/update_item_quantity/` - Update item quantity
- `POST /api/carts/:id/checkout/` - Process checkout


### Orders
- `GET /api/orders/` - List all orders (filtered by user for non-admins)
- `GET /api/orders/:id/` - Get order details
- `POST /api/orders/:id/update_status/` - Update order status (admin only)


### Invoices
- `GET /api/invoices/get_by_order/?order_id=<uuid>` - Get invoice by order ID

## User Roles


### Admin
- Full access to all features
- Manage food items and categories
- Process orders and update status
- View all orders and user data


### Regular User
- Browse menu and search for items
- Add items to cart and place orders
- View personal order history and invoices
- Update personal information

## Data Persistence


The application uses SQLite as the default database for development. All data is stored persistently and will be available even after restarting the application.

## Deployment


For production deployment:
1. Update `DEBUG = False` in settings.py
2. Configure a production-ready database like PostgreSQL
3. Set up proper static file serving
4. Use a production WSGI server like Gunicorn with Nginx

## License


[MIT License](LICENSE)
