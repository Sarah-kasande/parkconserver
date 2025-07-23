-- phpMyAdmin SQL Dump
-- Version: 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 19, 2025 at 04:20 AM
-- Server Version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `park_conservation`
--

-- --------------------------------------------------------

--
-- Table structure for table `admintable`
--

CREATE TABLE `admintable` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'admin',
  `park_name` varchar(100) DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admintable`
--

INSERT INTO `admintable` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `phone`, `role`, `park_name`, `avatar_url`, `created_at`, `updated_at`, `last_login`) VALUES
(2, 'Pelyne', 'Doriane', 'admin@ecopark.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', '(555) 123-4567', 'admin', 'Volcanoes National Park', NULL, '2025-04-08 00:24:06', '2025-04-19 01:26:45', '2025-04-19 01:26:45');

-- --------------------------------------------------------

--
-- Table structure for table `auditors`
--

CREATE TABLE `auditors` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `park_name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('auditor') DEFAULT 'auditor',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `auditors`
--

INSERT INTO `auditors` (`id`, `first_name`, `last_name`, `email`, `park_name`, `password_hash`, `role`, `last_login`, `created_at`) VALUES
(1, 'Sarah', 'Williams', 'sarah.williams@auditgov.org', 'Volcanoes National Park', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'auditor', '2025-04-19 03:24:45', '2025-03-01 06:30:00'),
(2, 'James', 'Rodriguez', 'james.rodriguez@auditgov.org', 'Nyungwe National Park', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'auditor', '2025-04-06 16:20:00', '2025-02-20 12:00:00'),
(5, 'Muyumbu', 'Thomas', 'muyumbu@gmail.com', 'Akagera National Park', '165fbc4b0171b381216d06f9feb92b2b9394722120e90105a2187546e0f5ffe0', 'auditor', NULL, '2025-04-16 21:51:51'),
(7, 'Ganzam', 'Manzia', 'ganza@gmail.com', 'Gishwati-Mukura National Park', '165fbc4b0171b381216d06f9feb92b2b9394722120e90105a2187546e0f5ffe0', 'auditor', NULL, '2025-04-16 23:27:00'),
(8, 'Glo', 'Rilla', 'lgalo@gmail.com', 'Nyungwe National Park', '165fbc4b0171b381216d06f9feb92b2b9394722120e90105a2187546e0f5ffe0', 'auditor', NULL, '2025-04-16 23:35:33');

-- --------------------------------------------------------

--
-- Table structure for table `budgets`
--

CREATE TABLE `budgets` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `fiscal_year` varchar(20) NOT NULL,
  `total_amount` decimal(15,2) NOT NULL,
  `park_name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `reason` varchar(312) NOT NULL,
  `status` enum('draft','submitted','approved','rejected') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL,
  `approved_by` int(11) DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budgets`
--

INSERT INTO `budgets` (`id`, `title`, `fiscal_year`, `total_amount`, `park_name`, `description`, `reason`, `status`, `created_at`, `created_by`, `approved_by`, `approved_at`) VALUES
(1, 'Volcanoes National Park Budget', '2025', 2938.00, 'Volcanoes National Park', '', 'Budget approved by government officer', 'submitted', '2025-04-13 03:04:55', 3, 1, '2025-04-13 04:06:41'),
(2, 'Our Budget', '2025-26', 11500.00, 'Nyungwe National Park', '', '', 'submitted', '2025-04-15 11:46:14', 3, NULL, NULL),
(4, 'Pelyne\'s Budget', '2025-26', 10000.00, 'Akagera National Park', '', 'Budget approved by government officer', 'approved', '2025-04-16 00:50:41', 3, 3, '2025-04-19 00:35:54');

-- --------------------------------------------------------

--
-- Table structure for table `budget_items`
--

CREATE TABLE `budget_items` (
  `id` int(11) NOT NULL,
  `budget_id` int(11) NOT NULL,
  `category` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `amount` int(100) NOT NULL,
  `type` enum('expense','income') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `budget_items`
--

INSERT INTO `budget_items` (`id`, `budget_id`, `category`, `description`, `amount`, `type`) VALUES
(2, 1, 'Staff', 'We need new staff', 2938, 'expense'),
(3, 2, 'Donors', 'We need new donors', 1000, 'expense'),
(4, 2, 'Government Support', 'We need some government support', 10000, 'expense'),
(5, 2, 'Other Park Services', 'We shall utilize other park services', 500, 'expense'),
(6, 4, 'Staff', 'We need new staff', 10000, 'income');

-- --------------------------------------------------------

--
-- Table structure for table `donations`
--

CREATE TABLE `donations` (
  `id` int(11) NOT NULL,
  `donation_type` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `park_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `message` text DEFAULT NULL,
  `is_anonymous` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('completed','failed','pending') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `donations`
--

INSERT INTO `donations` (`id`, `donation_type`, `amount`, `park_name`, `first_name`, `last_name`, `email`, `message`, `is_anonymous`, `created_at`, `status`) VALUES
(1, 'oneTime', 500.00, 'Akagera National Park', 'Jiwdhw', 'Wuehwi', 'weuibweui', 'iwedhwedi', 0, '2025-04-07 17:37:40', 'completed'),
(2, 'oneTime', 500.00, 'Nyungwe National Park', 'Sdfghj', 'Dfghjk', 'm.david@gmail.com', 'fghjk', 0, '2025-04-07 17:57:37', 'pending'),
(3, 'oneTime', 500.00, 'Volcanoes National Park', 'Wert', 'Fgh', 'sdfgh', 'dfghj', 0, '2025-04-07 19:03:35', 'failed'),
(4, 'oneTime', 500.00, 'Gishwati-Mukura National Park', 'Y2e23ediu', 'Edhweuid', 'm.david@alustudent.com', 'grfh34uih4uifh34ui', 0, '2025-04-07 19:32:13', 'pending'),
(5, 'oneTime', 500.00, 'Volcanoes National Park', 'Manzi', 'Dilo', 'manzidilo@gmail.com', 'Hello, I want to do this for my family', 0, '2025-04-18 23:24:16', 'pending'),
(6, 'oneTime', 500.00, 'Nyungwe National Park', 'Manzi', 'Adaji', 'manziadaji@gmail.com', 'm.david@gmail.com m.david@gmail.com m.david@gmail.com', 0, '2025-04-18 23:28:10', 'pending'),
(7, 'oneTime', 500.00, 'Akagera National Park', 'Manz', 'Manz', 'manzdag@gmail.com', 'Hello, boy, help out please', 0, '2025-04-18 23:30:51', 'pending'),
(8, 'monthly', 100.00, 'Gishwati-Mukura National Park', 'Manzi', 'Debo', 'madebo@gmail.com', 'Hello, just stopped by to show you guys how great your work is on our lives', 0, '2025-04-19 01:40:12', 'pending');

-- --------------------------------------------------------

--
-- Table structure for table `emergency_requests`
--

CREATE TABLE `emergency_requests` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `park_name` varchar(100) NOT NULL,
  `emergency_type` varchar(50) NOT NULL,
  `justification` text NOT NULL,
  `timeframe` varchar(50) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_date` datetime DEFAULT NULL,
  `reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emergency_requests`
--

INSERT INTO `emergency_requests` (`id`, `title`, `description`, `amount`, `park_name`, `emergency_type`, `justification`, `timeframe`, `status`, `created_at`, `created_by`, `reviewed_by`, `reviewed_date`, `reason`) VALUES
(1, 'Fire Safety Response', 'We need some emergency help', 124.00, 'Nyungwe National Park', 'Safety Hazard', 'There have been some fires around our camps and working area', 'urgent', 'pending', '2025-04-11 23:04:17', 3, 1, '2025-04-13 00:42:40', 'I don\'t like this'),
(2, 'We Need to Repair', 'We need to repair our pipes at the park', 100.00, 'Akagera National Park', 'Maintenance', 'We need to repair because it is very important', 'urgent', 'rejected', '2025-04-19 00:06:05', 4, 3, '2025-04-19 02:35:41', 'I don\'t like this');

-- --------------------------------------------------------

--
-- Table structure for table `extra_funds_requests`
--

CREATE TABLE `extra_funds_requests` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `park_name` varchar(100) NOT NULL,
  `category` varchar(50) NOT NULL,
  `justification` text NOT NULL,
  `expected_duration` varchar(50) NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) DEFAULT NULL,
  `reviewed_by` int(11) DEFAULT NULL,
  `reviewed_date` datetime DEFAULT NULL,
  `reason` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `extra_funds_requests`
--

INSERT INTO `extra_funds_requests` (`id`, `title`, `description`, `amount`, `park_name`, `category`, `justification`, `expected_duration`, `status`, `created_at`, `created_by`, `reviewed_by`, `reviewed_date`, `reason`) VALUES
(1, 'Wildlife Research Initiative', 'Funding for advanced wildlife monitoring equipment', 124.00, 'Gishwati-Mukura National Park', 'Research', 'To enhance tracking and protection of endangered species', 'Half-year', 'approved', '2025-04-11 23:03:28', 3, 1, '2025-04-13 00:34:42', 'Approved for conservation efforts'),
(2, 'Community Education Program', 'Educational outreach for local communities', 12431.00, 'Nyungwe National Park', 'Education', 'To promote conservation awareness and reduce human-wildlife conflict', 'Quarter', 'rejected', '2025-04-11 23:09:24', 3, 1, '2025-04-19 03:09:27', 'Insufficient budget justification'),
(3, 'We Need to Repair', 'We need to repair infrastructure', 1000.00, 'Akagera National Park', 'Hiring New Staff', 'We need to repair and hire staff for maintenance', 'Annual', 'pending', '2025-04-19 00:06:41', 4, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `finance_officers`
--

CREATE TABLE `finance_officers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `park_name` varchar(100) DEFAULT NULL,
  `role` enum('finance') DEFAULT 'finance',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `finance_officers`
--

INSERT INTO `finance_officers` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `park_name`, `role`, `last_login`, `created_at`) VALUES
(3, 'Emily', 'Johnson', 'emily.johnson@parkfinance.org', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Nyungwe National Park', 'finance', '2025-04-19 03:25:14', '2025-01-15 07:00:00'),
(4, 'Michael', 'Chen', 'michael.chen@parkfinance.org', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Akagera National Park', 'finance', '2025-04-19 02:04:49', '2025-02-10 10:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `fund_requests`
--

CREATE TABLE `fund_requests` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `amount` decimal(15,2) NOT NULL,
  `category` varchar(50) NOT NULL,
  `parkname` varchar(255) NOT NULL,
  `urgency` enum('low','medium','high') NOT NULL,
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_by` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fund_requests`
--

INSERT INTO `fund_requests` (`id`, `title`, `description`, `amount`, `category`, `parkname`, `urgency`, `status`, `created_at`, `created_by`) VALUES
(1, 'Trail Maintenance Equipment', 'We want salaries for the Volcanoes National Park', 124.00, 'Salaries', 'Volcanoes National Park', 'high', 'pending', '2025-04-09 20:19:20', 2),
(2, 'Funding', 'We want funding for the Gishwati-Mukura National Park association initiative', 134.00, 'Other', 'Gishwati-Mukura National Park', 'medium', 'approved', '2025-04-09 21:19:50', 2),
(3, 'Advanced Research & Management', 'We are to focus on advanced research & management', 493.00, 'Safety', 'Akagera National Park', 'high', 'pending', '2025-04-16 01:14:29', 2),
(4, 'Trail One', 'New trail is needed by the staff', 1000.00, 'Safety', 'Nyungwe National Park', 'high', 'pending', '2025-04-16 21:39:01', 5),
(5, 'Next Trail', 'I need the next trail', 2000.00, 'Safety', 'Akagera National Park', 'low', 'pending', '2025-04-18 19:30:35', 2),
(6, 'New Request', 'Funding for conservation equipment', 200.00, 'Research', 'Volcanoes National Park', 'high', 'rejected', '2025-04-18 23:58:58', 2);

-- --------------------------------------------------------

--
-- Table structure for table `government_officers`
--

CREATE TABLE `government_officers` (
  `id` int(11) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `park_name` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('government') DEFAULT 'government',
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `government_officers`
--

INSERT INTO `government_officers` (`id`, `first_name`, `last_name`, `email`, `park_name`, `password_hash`, `role`, `last_login`, `created_at`) VALUES
(1, 'Laura', 'Davis', 'laura.davis@gov.org', 'Volcanoes National Park', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'government', '2025-04-19 03:11:36', '2025-01-25 08:00:00'),
(3, 'Ganza', 'Brave', 'Ganza.brave@yahoo.com', 'Nyungwe National Park', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'government', '2025-04-19 02:14:46', '2025-04-15 21:04:17'),
(6, 'Glo', 'Rilla', 'flo@gmail.com', 'Akagera National Park', '165fbc4b0171b381216d06f9feb92b2b9394722120e90105a2187546e0f5ffe0', 'government', NULL, '2025-04-16 23:35:17');

-- --------------------------------------------------------

--
-- Table structure for table `login_logs`
--

CREATE TABLE `login_logs` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL,
  `login_time` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `parkstaff`
--

CREATE TABLE `parkstaff` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `park_name` varchar(255) NOT NULL,
  `role` varchar(50) DEFAULT 'park-staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parkstaff`
--

INSERT INTO `parkstaff` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `park_name`, `role`, `created_at`, `last_login`) VALUES
(2, 'Glo', 'Gisa', 'Ganza.dany@yahoo.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Akagera National Park', 'park-staff', '2025-04-07 21:48:16', '2025-04-19 01:26:05'),
(4, 'Bob', 'Johnson', 'bob.audit@park.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Gishwati-Mukura National Park', 'park-staff', '2025-04-09 16:45:43', NULL),
(5, 'Carol', 'Williams', 'carol.gov@park.com', '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8', 'Nyungwe National Park', 'park-staff', '2025-04-09 16:45:43', '2025-04-16 21:38:21'),
(7, 'Manzi', 'David', 'amabutho@gmail.com', '165fbc4b0171b381216d06f9feb92b2b9394722120e90105a2187546e0f5ffe0', 'Volcanoes National Park', 'park-staff', '2025-04-15 22:10:10', NULL),
(8, 'Manzi', 'David', 'manzi12@gmail.com', '165fbc4b0171b381216d06f9feb92b2b9394722120e90105a2187546e0f5ffe0', 'Akagera National Park', 'park-staff', '2025-04-16 23:30:03', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `transaction_id` varchar(50) NOT NULL,
  `payment_type` enum('donation','tour') NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `card_name` varchar(100) NOT NULL,
  `card_number_last4` char(4) NOT NULL,
  `expiry_date` varchar(7) NOT NULL,
  `status` enum('pending','completed','failed') NOT NULL DEFAULT 'completed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `park_name` varchar(100) DEFAULT NULL,
  `customer_email` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `transaction_id`, `payment_type`, `amount`, `card_name`, `card_number_last4`, `expiry_date`, `status`, `created_at`, `park_name`, `customer_email`) VALUES
(1, 'TR-250407213603-618', 'tour', 900.00, 'Debo Wills', '5432', '20/2025', 'completed', '2025-04-07 19:36:03', 'Volcanoes National Park', 'themanzi.david@gmail.com'),
(2, 'TR-250412211824-699', 'tour', 225.00, 'Debo Wills', '6543', '20/2025', 'completed', '2025-04-12 19:18:24', 'Gishwati-Mukura National Park', 'm.david@alustudent.com'),
(3, 'TR-250415131944-235', 'tour', 750.00, 'Glo Hag', '3900', '20/2025', 'completed', '2025-04-15 11:19:44', 'Nyungwe National Park', 'admin@ecopark.com'),
(4, 'TR-250419033904-981', 'tour', 675.00, 'Debo Wills', '2345', '20/2025', 'completed', '2025-04-19 01:39:04', 'Akagera National Park', 'erjeoifdfgh@gmail.com');

-- --------------------------------------------------------

--
-- Table structure for table `services`
--

CREATE TABLE `services` (
  `id` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `company_type` varchar(100) NOT NULL,
  `provided_service` varchar(100) NOT NULL,
  `company_name` varchar(100) NOT NULL,
  `company_registration` longblob DEFAULT NULL,
  `application_letter` longblob DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') DEFAULT 'pending',
  `tax_id` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `services`
--

-- --------------------------------------------------------

--
-- Table structure for table `tours`
--

CREATE TABLE `tours` (
  `id` int(11) NOT NULL,
  `park_name` varchar(100) NOT NULL,
  `tour_name` varchar(100) NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `guests` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `special_requests` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `status` enum('completed','failed','pending') DEFAULT 'pending'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `tours`
--

INSERT INTO `tours` (`id`, `park_name`, `tour_name`, `date`, `time`, `guests`, `amount`, `first_name`, `last_name`, `email`, `phone`, `special_requests`, `created_at`, `status`) VALUES
(1, 'Volcanoes National Park', '', '2025-04-18', '00:00:00', 12, 900, 'Manzi', 'David', 'themanzi.david@gmail.com', '(+250) 791 291 003', 'f23ev23e', '2025-04-07 19:35:00', 'completed'),
(2, 'Gishwati-Mukura National Park', '', '2025-04-17', '02:21:00', 2, 150, 'Manzi', 'David', 'admin@ecopark.com', '+250 791 291 003', 'herhioerio eriorrefiojrfio', '2025-04-11 20:23:46', 'completed'),
(3, 'Nyungwe National Park', '', '2025-04-24', '21:20:00', 3, 225, 'Manzi', 'David', 'm.david@alustudent.com', '+250791291003', 'helo boy', '2025-04-12 19:18:13', 'completed'),
(4, 'Akagera National Park', '', '2025-04-16', '15:18:00', 10, 750, 'Glo', 'Hag', 'admin@ecopark.com', '+250791291003', 'I booked a tour today', '2025-04-15 11:18:45', 'completed'),
(5, 'Volcanoes National Park', '', '2025-04-25', '07:38:00', 9, 675, 'Erjeoif', 'Dfgh', 'erjeoifdfgh@gmail.com', NULL, 'Hello there; Could I help any place here with donations', '2025-04-19 01:38:37', 'completed');

-- --------------------------------------------------------

--
-- Table structure for table `visitors`
--

CREATE TABLE `visitors` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `visitors`
--

INSERT INTO `visitors` (`id`, `first_name`, `last_name`, `email`, `password_hash`, `last_login`, `created_at`) VALUES
(1, 'Ganza', 'Twilight', 'm.david@gmail.com', '81ae71347621f7f8ac12bf90c8287b1f:2c332a8c76bef65e593e3b72ac0ad7948a9cc6ac3ddbb86fdfbead9869192f27', '2025-04-19 03:29:55', '2025-04-16 17:13:42'),
(2, 'Yahoo', 'Boy', 'yahooboy@gmail.com', 'deae7a94f169a175b4d981813e7c2740:19f6b320c58b3c3ab22b8c5759bc97a429a578a0a8cbcb1635e93a012e1af6bd', NULL, '2025-04-16 17:15:12'),
(3, 'Ganza', 'Gauch', 'ganzauch@gmail.com', 'c4b71fd05473cf967bc8103f683a2c32:391d67ee2ea7038cbcf08d845c94f067540929d725c479a71471951300663cc0', '2025-04-16 19:26:57', '2025-04-16 17:17:21'),
(4, 'Pelyne', 'Diego', 'diego@gmail.com', 'ca1a0b9571d9e86a2041fdf08782c568:ecf01db6342402943c29b40ffddbff4941aa286cff7781658a5d8f3c8e2f07e2', NULL, '2025-04-16 19:13:37'),
(5, 'New', 'Visitor', 'newvisitor@gmail.com', '0f58ad26396beef84b019103950b40d7:a7de8be8a1a18b8654de1adee33ecb44ffd68b89e8ad08dc440f3f4d382615fd', '2025-04-16 21:23:30', '2025-04-16 19:23:13'),
(6, 'Genzi', 'Rogers', 'genzirogers@gmail.com', 'f5ed200fc4fcd0f19a08abe584f391a5:efface164cfb3c5987990b960afc72d9b1382656e8f08e661ece1a8fda188c36', NULL, '2025-04-18 23:27:08');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admintable`
--
ALTER TABLE `admintable`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `auditors`
--
ALTER TABLE `auditors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `budgets`
--
ALTER TABLE `budgets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`),
  ADD KEY `approved_by` (`approved_by`);

--
-- Indexes for table `budget_items`
--
ALTER TABLE `budget_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `budget_id` (`budget_id`);

--
-- Indexes for table `donations`
--
ALTER TABLE `donations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `extra_funds_requests`
--
ALTER TABLE `extra_funds_requests`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `finance_officers`
--
ALTER TABLE `finance_officers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `fund_requests`
--
ALTER TABLE `fund_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indexes for table `government_officers`
--
ALTER TABLE `government_officers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `parkstaff`
--
ALTER TABLE `parkstaff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaction_id` (`transaction_id`);

--
-- Indexes for table `services`
--
ALTER TABLE `services`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tours`
--
ALTER TABLE `tours`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `visitors`
--
ALTER TABLE `visitors`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admintable`
--
ALTER TABLE `admintable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `auditors`
--
ALTER TABLE `auditors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `budgets`
--
ALTER TABLE `budgets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `budget_items`
--
ALTER TABLE `budget_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `donations`
--
ALTER TABLE `donations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `emergency_requests`
--
ALTER TABLE `emergency_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `extra_funds_requests`
--
ALTER TABLE `extra_funds_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `finance_officers`
--
ALTER TABLE `finance_officers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `fund_requests`
--
ALTER TABLE `fund_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `government_officers`
--
ALTER TABLE `government_officers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `login_logs`
--
ALTER TABLE `login_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `parkstaff`
--
ALTER TABLE `parkstaff`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `services`
--
ALTER TABLE `services`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tours`
--
ALTER TABLE `tours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `visitors`
--
ALTER TABLE `visitors`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `budgets`
--
ALTER TABLE `budgets`
  ADD CONSTRAINT `budgets_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `finance_officers` (`id`),
  ADD CONSTRAINT `budgets_ibfk_2` FOREIGN KEY (`approved_by`) REFERENCES `government_officers` (`id`);

--
-- Constraints for table `budget_items`
--
ALTER TABLE `budget_items`
  ADD CONSTRAINT `budget_items_ibfk_1` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `fund_requests`
--
ALTER TABLE `fund_requests`
  ADD CONSTRAINT `fund_requests_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `parkstaff` (`id`);

--
-- Constraints for table `login_logs`
--
ALTER TABLE `login_logs`
  ADD CONSTRAINT `login_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `admintable` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;