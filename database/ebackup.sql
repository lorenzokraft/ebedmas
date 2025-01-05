-- MySQL dump 10.13  Distrib 8.3.0, for Linux (x86_64)
--
-- Host: localhost    Database: ebedmas_learning
-- ------------------------------------------------------
-- Server version	8.0.39-0ubuntu0.22.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin_users`
--

DROP TABLE IF EXISTS `admin_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin_users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','super_admin','editor') NOT NULL DEFAULT 'admin',
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `admin_users_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin_users`
--

LOCK TABLES `admin_users` WRITE;
/*!40000 ALTER TABLE `admin_users` DISABLE KEYS */;
INSERT INTO `admin_users` VALUES (5,'Super Admin','superadmin@ebedmas.com','$2b$10$g7XyIswemzL2l74bGdSYnum99fIRmnTzY7lHXkUucEBbI49i0DBDq','super_admin','active','2024-11-28 12:12:13','2024-12-15 15:44:07',NULL),(6,'Admin User','admin@example.com','$2b$10$nh8PNNZbuHqeYEIHLT673OLzqE/UVYSw3eJL.v67SBxEemEbnBOlG','admin','active','2024-12-12 16:53:12','2024-12-15 15:44:04',NULL),(7,'Lawrence Omole','lawrence@ebedmas.com','$2b$10$G3CDfo8W2NRPym7R1ZH8LOSmmvFlJGgqpTHPP58le27FAqUMz3Vva','super_admin','active','2024-12-15 15:24:28','2024-12-15 15:44:01',5);
/*!40000 ALTER TABLE `admin_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `grades`
--

DROP TABLE IF EXISTS `grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grades` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `grades_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `grades`
--

LOCK TABLES `grades` WRITE;
/*!40000 ALTER TABLE `grades` DISABLE KEYS */;
INSERT INTO `grades` VALUES (13,'Grade 5',NULL,'2024-11-28 22:56:43','2024-11-28 22:56:43'),(19,'Year 1',5,'2024-12-15 12:26:20','2024-12-21 13:58:36'),(22,'Year 3',5,'2024-12-21 15:02:32','2024-12-21 15:02:32'),(23,'Year 5',5,'2024-12-25 01:30:17','2024-12-25 01:30:17'),(24,'Year 2',5,'2024-12-28 16:41:41','2024-12-28 16:41:41'),(25,'Year 4',5,'2024-12-28 16:41:55','2024-12-28 16:41:55'),(26,'Year 6',5,'2024-12-28 20:58:37','2024-12-28 20:58:37');
/*!40000 ALTER TABLE `grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_images`
--

DROP TABLE IF EXISTS `question_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `question_images_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_images`
--

LOCK TABLES `question_images` WRITE;
/*!40000 ALTER TABLE `question_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `question_options`
--

DROP TABLE IF EXISTS `question_options`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `question_options` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_id` int NOT NULL,
  `option_text` text NOT NULL,
  `is_correct` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `question_id` (`question_id`),
  CONSTRAINT `question_options_ibfk_1` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `question_options`
--

LOCK TABLES `question_options` WRITE;
/*!40000 ALTER TABLE `question_options` DISABLE KEYS */;
/*!40000 ALTER TABLE `question_options` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `questions`
--

DROP TABLE IF EXISTS `questions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `questions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `question_text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'multiple_choice',
  `options` json DEFAULT NULL,
  `correct_answer` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `explanation` text COLLATE utf8mb4_unicode_ci,
  `images` text COLLATE utf8mb4_unicode_ci,
  `grade_id` int NOT NULL,
  `subject_id` int NOT NULL,
  `topic_id` int NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `order_num` int DEFAULT '0',
  `audio_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `question_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `explanation_image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `equation` text COLLATE utf8mb4_unicode_ci,
  `units` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `diagram` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `formula` text COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `grade_id` (`grade_id`),
  KEY `subject_id` (`subject_id`),
  KEY `topic_id` (`topic_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `questions_ibfk_1` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questions_ibfk_2` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questions_ibfk_3` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `questions_ibfk_4` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`),
  CONSTRAINT `questions_chk_1` CHECK ((`question_type` in (_utf8mb4'multiple_choice',_utf8mb4'text',_utf8mb4'draw',_utf8mb4'paint',_utf8mb4'drag',_utf8mb4'click')))
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `questions`
--

LOCK TABLES `questions` WRITE;
/*!40000 ALTER TABLE `questions` DISABLE KEYS */;
INSERT INTO `questions` VALUES (2,'Put these numbers in ascending order, so that we can read them together how they should appear as per numerical principles ','drag','[\"1\", \"8\", \"5\", \"2\"]','1,2,5,8','When you are asked to arrange a number in an ascending order, its the same as asking you to arrange them in sequence how they should be followed ',NULL,19,2,8,5,'2024-12-15 14:31:56','2024-12-15 14:38:44',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(3,'Take a close look at the number on your screen and only Click on all the even numbers:\n\n','text','[\"1\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\"]','2,4,6,8','Even numbers are numbers that can be divided by 2 with no remainder. In this set, those numbers are 2, 4, and 6.',NULL,19,2,8,5,'2024-12-15 14:41:33','2024-12-15 14:41:33',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(5,'What is your name ?','text','[[\"Maria\", \"Dayo\", \"Taye\"]]','Dayo','your name is Dayo',NULL,19,1,13,5,'2024-12-21 12:23:58','2024-12-21 14:04:21',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'Sunlight gives energy','click','[\"YES\", \"NO\"]','YES','Yes sunlight gives energy',NULL,19,5,15,5,'2024-12-21 14:26:02','2024-12-21 14:26:02',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(7,'Motion is anything that moves ?','click','[\"YES\", \"NO\"]','YES','Yes motion moves',NULL,19,5,11,5,'2024-12-21 14:40:59','2024-12-21 14:40:59',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(8,'Find the letter P','click','[\"A\", \"B\", \"C\", \"D\", \"E\", \"F\", \"G\", \"H\", \"I\", \"J\", \"K\", \"L\", \"M\", \"N\", \"O\", \"P\", \"Q\", \"R\", \"S\", \"T\", \"U\", \"V\", \"W\", \"X\", \"Y\", \"Z\"]','P','P is in round Shape',NULL,19,1,12,5,'2024-12-21 14:59:54','2024-12-21 14:59:54',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(9,'How many syllables does the world OCTOPUS  have?\n','click','[\"1\", \"2\", \"3\"]','3','Words are made up of  syllable. Each syllable has one vowel sound. To count syllables, try clapping as you say each part of a word. You can also count how many times your jaw drops as you say each part of the word.',NULL,22,1,16,5,'2024-12-21 15:17:09','2024-12-21 15:17:09',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'dsdsds','click','[\"sds\", \"s\", \"dd\"]','s','dsdsd',NULL,22,1,7,5,'2024-12-21 16:32:54','2024-12-21 16:32:54',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'After a special event, a caterer examined the leftovers on the serving table. She saw 1/4 of a tartlet with apples, 1/4 of a tartlet with strawberries, and 1/4 of a tartlet with raspberries. How many leftover tattlers did the caterer have?','text','[\"21\", \"22\", \"10\", \"6\"]','10','answer is 10',NULL,23,2,17,5,'2024-12-25 01:34:05','2024-12-25 01:34:05',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(14,'Find Letter A','click','[\"A\", \"B\", \"C\", \"D\", \"E\", \"F\", \"G\", \"H\", \"I\", \"J\", \"K\", \"L\", \"M\", \"N\", \"O\", \"P\", \"Q\", \"R\", \"S\", \"T\", \"U\", \"V\", \"W\", \"X\", \"Y\", \"Z\", \".\"]','A','The letters of the alphabet go in a special order:\nA B C D E F G H I J K L M N O P Q R S T U V W X Y Z\nThis is called ABC order.\n\nThe correct answer is A',NULL,19,1,12,5,'2024-12-28 01:49:24','2024-12-28 01:49:24',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(16,'What is the median?','click','[\"2\", \"5\", \"10\", \"9\", \"6\", \"6\", \"8\"]','6','To solve this question, First, arrange the numbers from least to greatest: [25668910]\nWhen the numbers are arranged from least to greatest, the median is the number in the middle.',NULL,13,2,17,5,'2024-12-28 16:26:08','2024-12-28 16:26:08',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'this is an example of a text question and the answer is \"Ebedmas\" without the quote','text','[\"Test\", \"Ebedmas\", \"John\"]','Ebedmas','Ebedmas',NULL,19,1,12,5,'2024-12-28 21:16:02','2024-12-28 21:16:02',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(18,'sdsdsds','click','[\"[\\\"A\\\",\\\"B\\\"]\"]','A','fdfdf',NULL,24,1,19,5,'2024-12-29 18:48:48','2024-12-29 18:48:48',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(19,'Listen to the word. How many syllables does the word Long have?','click','[\"[\\\"Two\\\",\\\"One\\\",\\\"Thress\\\"]\"]','Two','sdsdsdsd',NULL,19,1,22,5,'2024-12-29 18:55:29','2024-12-29 21:00:00',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(20,'What Pix can you see?','click','[\"[\\\"Yes\\\",\\\"No\\\"]\"]','Yes','dfdf',NULL,19,1,19,5,'2024-12-29 19:00:37','2024-12-29 19:00:37',0,NULL,'/uploads/questions/question_image-1735498836998-42616720.png',NULL,NULL,NULL,NULL,NULL),(21,'what is 2 + 2','text','[\"4\", \"1\", \"3\"]','4','4',NULL,24,2,8,5,'2024-12-29 20:25:45','2024-12-29 20:25:45',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(22,'what is 5+5','text','[[\"10\", \"5\"]]','1-','111',NULL,13,2,8,5,'2024-12-29 20:36:53','2024-12-29 20:42:27',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(23,'sasasa','text','[\"s\", \"a\"]','s','sasas',NULL,19,2,17,5,'2024-12-29 20:37:55','2024-12-29 20:37:55',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(24,'fdfdf','click','[\"112\", \"222\"]','222','eeee',NULL,25,1,12,5,'2024-12-29 20:43:49','2024-12-29 20:43:49',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,'some','click','[\"A\", \"B\"]','B','dfdf',NULL,24,2,8,5,'2024-12-29 21:14:47','2024-12-29 21:14:47',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,'What is 5 × 4?','text','[\"16\", \"20\", \"24\", \"25\"]','20','To solve 5 × 4, you can add 5 four times: 5 + 5 + 5 + 5 = 20',NULL,24,2,24,5,'2024-12-29 21:48:41','2024-12-29 21:48:41',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,'year 3 quest','click','[\"1\", \"2\"]','1','sasa',NULL,22,2,27,5,'2024-12-29 22:01:43','2024-12-29 22:01:43',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,'ddfdfd','text','[\"d\", \"f\"]','d','fdfd',NULL,24,5,18,5,'2024-12-29 22:34:08','2024-12-29 22:34:08',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,'dfdff','click','[\"a\", \"s\"]','a','sas',NULL,22,5,11,5,'2024-12-30 09:53:39','2024-12-30 09:53:39',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(31,'Science year 4 Question','click','[\"A\", \"B\"]','A','aaa',NULL,25,5,29,5,'2024-12-30 10:46:12','2024-12-30 10:46:12',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `questions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `quizzes`
--

DROP TABLE IF EXISTS `quizzes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `quizzes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(225) NOT NULL,
  `description` text,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `quizzes_ibfk_1` (`created_by`),
  CONSTRAINT `quizzes_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `quizzes`
--

LOCK TABLES `quizzes` WRITE;
/*!40000 ALTER TABLE `quizzes` DISABLE KEYS */;
/*!40000 ALTER TABLE `quizzes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subjects`
--

DROP TABLE IF EXISTS `subjects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subjects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `subjects_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subjects`
--

LOCK TABLES `subjects` WRITE;
/*!40000 ALTER TABLE `subjects` DISABLE KEYS */;
INSERT INTO `subjects` VALUES (1,'English Language',5,'2024-11-29 00:32:42','2024-11-29 00:32:42'),(2,'Mathematics',5,'2024-11-29 00:56:24','2024-12-21 13:26:08'),(5,'Science',5,'2024-12-03 10:53:11','2024-12-03 10:53:11');
/*!40000 ALTER TABLE `subjects` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription_plans`
--

DROP TABLE IF EXISTS `subscription_plans`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription_plans` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL,
  `duration` int NOT NULL,
  `duration_unit` enum('day','month','year') NOT NULL,
  `features` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription_plans`
--

LOCK TABLES `subscription_plans` WRITE;
/*!40000 ALTER TABLE `subscription_plans` DISABLE KEYS */;
INSERT INTO `subscription_plans` VALUES (4,'Gold Plan','Some plan gld',29.99,1,'month','Everything in Third Plan \nUnlimited Children \nBest student Award \nNominations for Global talent \n',1,'2024-12-21 08:54:33'),(7,'Family Plan','sdsdsd',22.00,1,'month','Access to all Subject\nUnlimited Class\nAward and Prices\nOver 1 million practice questions',1,'2024-12-21 09:25:43');
/*!40000 ALTER TABLE `subscription_plans` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptions`
--

DROP TABLE IF EXISTS `subscriptions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `plan_id` int NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` enum('active','expired','frozen') DEFAULT 'active',
  `card_last_four` varchar(4) DEFAULT NULL,
  `card_holder_name` varchar(100) DEFAULT NULL,
  `auto_renew` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `plan_id` (`plan_id`),
  CONSTRAINT `subscriptions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  CONSTRAINT `subscriptions_ibfk_2` FOREIGN KEY (`plan_id`) REFERENCES `subscription_plans` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptions`
--

LOCK TABLES `subscriptions` WRITE;
/*!40000 ALTER TABLE `subscriptions` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `topic_distribution`
--

DROP TABLE IF EXISTS `topic_distribution`;
/*!50001 DROP VIEW IF EXISTS `topic_distribution`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `topic_distribution` AS SELECT 
 1 AS `subject_name`,
 1 AS `grade_name`,
 1 AS `topic_count`,
 1 AS `question_count`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `topic_grades`
--

DROP TABLE IF EXISTS `topic_grades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topic_grades` (
  `topic_id` int NOT NULL,
  `grade_id` int NOT NULL,
  PRIMARY KEY (`topic_id`,`grade_id`),
  KEY `grade_id` (`grade_id`),
  CONSTRAINT `topic_grades_ibfk_1` FOREIGN KEY (`topic_id`) REFERENCES `topics` (`id`),
  CONSTRAINT `topic_grades_ibfk_2` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topic_grades`
--

LOCK TABLES `topic_grades` WRITE;
/*!40000 ALTER TABLE `topic_grades` DISABLE KEYS */;
INSERT INTO `topic_grades` VALUES (8,19),(11,19),(12,19),(13,19),(14,19),(15,19),(19,19),(7,22),(10,22),(16,22),(27,22),(28,22),(29,22),(30,22),(17,23),(18,24),(24,24),(22,25);
/*!40000 ALTER TABLE `topic_grades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topic_year_mapping`
--

DROP TABLE IF EXISTS `topic_year_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topic_year_mapping` (
  `topic_pattern` varchar(255) DEFAULT NULL,
  `year_number` int DEFAULT NULL,
  `subject_name` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topic_year_mapping`
--

LOCK TABLES `topic_year_mapping` WRITE;
/*!40000 ALTER TABLE `topic_year_mapping` DISABLE KEYS */;
INSERT INTO `topic_year_mapping` VALUES ('Numbers to 100',1,'Mathematics'),('Addition%',1,'Mathematics'),('Identify numbers',1,'Mathematics'),('Basic measurements',1,'Mathematics'),('Shapes and patterns',1,'Mathematics'),('fractions',5,'Mathematics'),('Prime numbers',5,'Mathematics'),('Geometry',5,'Mathematics'),('Converting units',5,'Mathematics');
/*!40000 ALTER TABLE `topic_year_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `topics`
--

DROP TABLE IF EXISTS `topics`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `topics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `subject_id` int DEFAULT NULL,
  `created_by` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `description` text,
  `grade_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `fk_subject` (`subject_id`),
  KEY `fk_grade` (`grade_id`),
  CONSTRAINT `fk_grade` FOREIGN KEY (`grade_id`) REFERENCES `grades` (`id`),
  CONSTRAINT `fk_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `topics_ibfk_1` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`),
  CONSTRAINT `topics_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `admin_users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `topics`
--

LOCK TABLES `topics` WRITE;
/*!40000 ALTER TABLE `topics` DISABLE KEYS */;
INSERT INTO `topics` VALUES (7,'Vocabulary',1,5,'2024-11-29 10:33:09','2024-12-28 00:21:15',NULL,22),(8,'Addition Of Number',2,5,'2024-11-29 10:33:42','2024-12-28 00:57:43',NULL,19),(10,'Linking Words',1,5,'2024-12-15 00:54:10','2024-12-28 00:21:15',NULL,22),(11,'Law of Motion',5,5,'2024-12-15 00:58:03','2024-12-28 03:15:21',NULL,19),(12,'Letter identification',1,5,'2024-12-15 10:19:33','2024-12-28 00:21:10',NULL,19),(13,'Nouns',1,5,'2024-12-15 12:10:53','2024-12-28 00:21:10',NULL,19),(14,'Identify numbers',2,5,'2024-12-17 12:15:38','2024-12-28 00:57:43',NULL,19),(15,'Sunlight',5,5,'2024-12-21 14:24:33','2024-12-28 03:15:21',NULL,19),(16,'Syllables',1,5,'2024-12-21 15:03:16','2024-12-28 00:21:15',NULL,22),(17,'fractions',2,5,'2024-12-25 01:32:51','2024-12-28 00:58:10',NULL,23),(18,'Light and sound',5,5,'2024-12-28 16:50:41','2024-12-30 08:53:37',NULL,24),(19,'Test Topic',1,5,'2024-12-28 20:58:57','2024-12-30 09:04:03',NULL,19),(22,'Complex sentences',1,5,'2024-12-29 20:56:51','2024-12-29 20:56:51','Practice forming and understanding complex sentences',25),(24,'Multiplication and Division',2,5,'2024-12-29 21:45:15','2024-12-29 21:45:15','Practice basic multiplication and division concepts',24),(27,'Year 3 Topic',2,5,'2024-12-29 22:01:04','2024-12-29 22:24:53',NULL,22),(28,'Plants and Growth',5,5,'2024-12-30 10:18:35','2024-12-30 10:18:35','Learn about plant life cycles and growth',22),(29,'Forces and Motion',5,5,'2024-12-30 10:18:35','2024-12-30 10:18:35','Explore different types of forces and movement',22),(30,'Light and Shadow',5,5,'2024-12-30 10:18:35','2024-12-30 10:18:35','Understand how light travels and shadows form',22);
/*!40000 ALTER TABLE `topics` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_topic_insert` BEFORE INSERT ON `topics` FOR EACH ROW BEGIN
    IF NEW.grade_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'grade_id cannot be NULL';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `before_topic_update` BEFORE UPDATE ON `topics` FOR EACH ROW BEGIN
    IF NEW.grade_id IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'grade_id cannot be NULL';
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `email` varchar(225) NOT NULL,
  `username` varchar(225) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `password` varchar(255) NOT NULL,
  `id` int NOT NULL AUTO_INCREMENT,
  `role` varchar(20) DEFAULT 'user',
  `isSubscribed` tinyint(1) DEFAULT '0',
  `last_login` datetime DEFAULT NULL,
  `status` varchar(10) DEFAULT 'active',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('nellyanderson127@gmail.com','tell','2024-11-26 15:14:38','$2b$10$IUiMbwFOZDRK.iZ8F2jdFeBcEdDtlYRxdLmfj10YndhK1MNhGAmbS',1,'user',0,'2024-12-15 04:03:39','active'),('nellyanderson1272@gmail.com','tell2','2024-11-26 15:15:11','$2b$10$x9txI/RggFBldYZ4.cqStONIH2gMX24qyXye8CiilAB80kKh9ujRm',2,'user',0,NULL,'active'),('testuser@gmail.com','test User','2024-11-27 10:59:49','$2b$10$noMZRYXoQjIhiTFIlX6C8eHnvH68Ermp8tSncmipOkcSPNbb1IyyO',3,'user',0,NULL,'active'),('testis@gmail.com','testis','2024-11-27 11:02:17','$2b$10$fOFvvZ48bI8Hj0dJULUGyOcClsPIIxSaJ0wk9OodTRc3dau6Ms3.2',4,'user',0,NULL,'active'),('firstuser@gmail.com','firstuser','2024-11-27 11:18:49','$2b$10$dyhnixhxRhqAj56mejKNDONxWHhdohQ3nFFpJBMLEGBqbaMqSTr7O',5,'user',0,NULL,'active'),('kanester@gmail.com','Kanester','2024-11-27 11:38:40','$2b$10$m/rsi.zxi5MsLXNk3BzEY.AlnZr8.pEan0Tdvk/rQETs8OTufmbKO',6,'user',0,NULL,'active'),('solo@gmail.com','solo','2024-11-27 11:42:58','$2b$10$2T9O6vqnWQNxhqO4xslv2.f.5nQWkQ/HPn8tsCzA3NQbc9KGgdDLC',7,'user',0,NULL,'active'),('solo1@gmail.com','Solo one','2024-11-27 11:46:02','$2b$10$eW7YEKMZvL7zvGdbZX8fPuZ3AbLGi1T2Vjjcnoe/7FKPZO0iTc3Fi',8,'user',0,NULL,'active'),('tolulope@gmail.com','Tolulope ','2024-11-27 11:54:23','$2b$10$Z1QrnsKN45NqJkV3Bs5EMOICzZm.lJ0NC.UUU/7hDe4YnyTlyZrf.',9,'user',0,NULL,'active'),('james@gmail.com','James','2024-11-27 12:04:32','$2b$10$KOhN3RxXFOVK/ifUNQCLsusxu03DgvhmDzPWCOS85sOySOI.OAy3i',10,'user',0,NULL,'active'),('abayo@gmail.com','ABAyo','2024-11-27 12:06:33','$2b$10$YQGaKj6E1.QpkO1Ll.5yMOrd0cxWR.ta37WN9AUJNKY/7Nb8CAtIK',11,'user',0,NULL,'active'),('meetlawrence365@gmail.com','Lawrence omole ','2024-11-27 14:26:58','$2b$10$Vco/AzTwG1Ys5sIzhP1W/.rI3EvhUozoWcF7OqEwwYayub9TjeAfe',12,'user',0,'2024-12-30 00:26:39','active'),('janet@gmail.com','Janet','2024-11-27 23:15:55','$2b$10$lOGUZC6oljaWpBRFacweruIwhOzrxQo1PNjqeiVnkKyuEGa75aAg2',13,'user',0,NULL,'active'),('superadmin@ebedmas.com','superadmin','2024-12-08 19:08:43','$2b$10$3euPcmQFCiblsZeEu5s7p.9CMxPJh8Gh/JF.McHKFc1N5HgggK1tG',16,'admin',0,NULL,'active'),('user@example.com','testuser','2024-12-12 17:10:17','$2b$10$R8WkGXwyse1tkbeUA6FrIOMpnsw9mIvJGqtqMOeB04krPDugVb1ta',17,'user',0,NULL,'active'),('lawrence_kells@yahoo.com','Lorenzo_kraft','2024-12-12 17:33:47','$2b$10$YGbQWzXDaTvq5UOAcDoiK.a6WBPiNN/kPRh2kXw2GvS44ebSfQ6J2',18,'user',0,NULL,'active'),('meetjason365@gmail.com','Jason Omole','2024-12-12 17:45:14','$2b$10$/5UDno20moc5RjwGfW///.tAoHq36VE2DMxj.XSMdLqzQgK08bS0K',19,'user',0,'2024-12-29 23:56:40','active'),('toun@gmail.com','Toun','2024-12-14 07:31:57','$2b$10$wOQB4MRx0oziV.Mvp6iraOtvXSGtgMyiHxcWjAsIpEbiuVm4v.LdS',20,'user',0,'2024-12-15 04:30:11','active'),('joshuadada@gmail.com','Joshua Dada','2024-12-17 11:54:21','$2b$10$EG5O5jTMdmQkTh0HehtEguymge347MmlhEaRv.J9Rn5S71KlqZL2.',21,'user',0,NULL,'active');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Final view structure for view `topic_distribution`
--

/*!50001 DROP VIEW IF EXISTS `topic_distribution`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `topic_distribution` AS select `s`.`name` AS `subject_name`,`g`.`name` AS `grade_name`,count(`t`.`id`) AS `topic_count`,count(distinct `q`.`id`) AS `question_count` from (((`subjects` `s` join `grades` `g`) left join `topics` `t` on(((`t`.`subject_id` = `s`.`id`) and (`t`.`grade_id` = `g`.`id`)))) left join `questions` `q` on((`q`.`topic_id` = `t`.`id`))) group by `s`.`name`,`g`.`name` order by `s`.`name`,`g`.`name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-12-30 22:30:56
