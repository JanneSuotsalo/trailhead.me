CREATE TABLE `file`
(
  `fileID` INT AUTO_INCREMENT,
  `fileTypeID` TINYINT NOT NULL,
  `filename` VARCHAR(256) NULL,
  `path` TEXT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `file_fileID_uindex`
  UNIQUE (`fileID`)
);

ALTER TABLE `file`
  ADD PRIMARY KEY (`fileID`);


CREATE TABLE `location`
(
  `locationID` INT AUTO_INCREMENT,
  `locationTypeID` TINYINT NOT NULL,
  `googlePlaceID` VARCHAR(128) NULL,
  `name` TEXT NULL,
  `coordinates` POINT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `location_locationID_uindex`
  UNIQUE (`locationID`)
);

ALTER TABLE `location`
  ADD PRIMARY KEY (`locationID`);


CREATE TABLE `user`
(
  `userID` INT AUTO_INCREMENT,
  `email` VARCHAR(254) NOT NULL,
  `username` VARCHAR(32) NOT NULL,
  `displayName` VARCHAR(32) NOT NULL,
  `password` CHAR(60) NOT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `user_email_uindex`
  UNIQUE (`email`),
  CONSTRAINT `user_userID_uindex`
  UNIQUE (`userID`),
  CONSTRAINT `user_username_uindex`
  UNIQUE (`username`)
);

ALTER TABLE `user`
  ADD PRIMARY KEY (`userID`);


CREATE TABLE `post`
(
  `postID` INT AUTO_INCREMENT,
  `userID` INT NOT NULL,
  `locationID` INT NULL,
  `text` VARCHAR(1024) NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `post_postID_uindex`
  UNIQUE (`postID`),

  CONSTRAINT `post_user_userID_fk`
  FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
    ON DELETE CASCADE,
  CONSTRAINT `post_location_locationID_fk`
  FOREIGN KEY (`locationID`) REFERENCES `location` (`locationID`)
    ON DELETE CASCADE
);

ALTER TABLE `post`
  ADD PRIMARY KEY (`postID`);


CREATE TABLE `postFile`
(
  `postID` INT NOT NULL,
  `fileID` INT NOT NULL,

  CONSTRAINT `post_file_file_fileID_fk`
  FOREIGN KEY (`fileID`) REFERENCES `file` (`fileID`),
  CONSTRAINT `post_file_post_postID_fk`
  FOREIGN KEY (`postID`) REFERENCES `post` (`postID`)
    ON DELETE CASCADE
);


CREATE TABLE `comment`
(
  `commentID` INT AUTO_INCREMENT,
  `userID` INT NOT NULL,
  `postID` INT NOT NULL,
  `text` VARCHAR(256) NOT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `comment_commentID_uindex`
  UNIQUE (`commentID`),

  CONSTRAINT `comment_post_postID_fk`
  FOREIGN KEY (`postID`) REFERENCES `post` (`postID`)
    ON DELETE CASCADE,
  CONSTRAINT `comment_user_userID_fk`
  FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
    ON DELETE CASCADE
);

ALTER TABLE `comment`
  ADD PRIMARY KEY (`commentID`);


CREATE TABLE `tag`
(
  `tagID` INT AUTO_INCREMENT,
  `text` VARCHAR(16) NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `tag_tagID_uindex`
  UNIQUE (`tagID`),
  CONSTRAINT `tag_text_uindex`
  UNIQUE (`text`)
);

ALTER TABLE `tag`
  ADD PRIMARY KEY (`tagID`);


CREATE TABLE `postTag`
(
  `tagID` INT NOT NULL,
  `postID` INT NOT NULL,

  CONSTRAINT `postTag_post_postID_fk`
  FOREIGN KEY (`postID`) REFERENCES `post` (`postID`)
    ON DELETE CASCADE,
  CONSTRAINT `postTag_tag_tagID_fk`
  FOREIGN KEY (`tagID`) REFERENCES `tag` (`tagID`)
);


CREATE TABLE `follower`
(
  `followerID` INT NOT NULL,
  `userID` INT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `follower_user_userID_fk`
  FOREIGN KEY (`followerID`) REFERENCES `user` (`userID`)
    ON DELETE CASCADE,
  CONSTRAINT `follower_user_userID_fk_2`
  FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
    ON DELETE CASCADE
);


CREATE TABLE `flag`
(
  `flagID` INT AUTO_INCREMENT,
  `userID` INT NOT NULL,
  `postID` INT NOT NULL,
  `reasonTypeID` TINYINT NOT NULL,
  `reasonStateID` TINYINT NOT NULL,
  `text` VARCHAR(1024) NOT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `flag_flagID_uindex`
  UNIQUE (`flagID`),

  CONSTRAINT `flag_post_postID_fk`
  FOREIGN KEY (`postID`) REFERENCES `post` (`postID`)
    ON DELETE CASCADE,
  CONSTRAINT `flag_user_userID_fk`
  FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
    ON DELETE CASCADE
);

ALTER TABLE `flag`
  ADD PRIMARY KEY (`flagID`);


CREATE TABLE `flagFile`
(
  `flagID` INT NOT NULL,
  `fileID` INT NOT NULL,

  CONSTRAINT `flag_file_file_fileID_fk`
  FOREIGN KEY (`fileID`) REFERENCES `file` (`fileID`),
  CONSTRAINT `flag_file_flag_flagID_fk`
  FOREIGN KEY (`flagID`) REFERENCES `flag` (`flagID`)
    ON DELETE CASCADE
);


CREATE TABLE `react`
(
  `reactID` INT AUTO_INCREMENT,
  `emoji` VARCHAR(16) NOT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `react_reactID_uindex`
  UNIQUE (`reactID`),
  CONSTRAINT `user_emoji_uindex`
  UNIQUE (`emoji`)
);

ALTER TABLE `react`
  ADD PRIMARY KEY (`reactID`);


CREATE TABLE `postReact`
(
  `postID` INT NOT NULL,
  `reactID` INT NOT NULL,
  `userID` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `postReact_post_postID_fk`
  FOREIGN KEY (`postID`) REFERENCES `post` (`postID`)
    ON DELETE CASCADE,
  CONSTRAINT `postReact_react_reactID_fk`
  FOREIGN KEY (`reactID`) REFERENCES `react` (`reactID`)
    ON DELETE CASCADE,
  CONSTRAINT `postReact_user_userID_fk`
  FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
    ON DELETE CASCADE
);


CREATE TABLE `collection`
(
  `collectionID` INT AUTO_INCREMENT,
  `userID` INT NOT NULL,
  `name` VARCHAR(128) NOT NULL,
  `description` VARCHAR(1024) NOT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `collection_collectionID_uindex`
  UNIQUE (`collectionID`),

  CONSTRAINT `collection_user_userID_fk`
  FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
    ON DELETE CASCADE
);

ALTER TABLE `collection`
  ADD PRIMARY KEY (`collectionID`);


CREATE TABLE `collectionPost`
(
  `collectionID` INT NOT NULL,
  `postID` INT NOT NULL,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `collectionPost_collection_collectionID_fk`
  FOREIGN KEY (`collectionID`) REFERENCES `collection` (`collectionID`)
    ON DELETE CASCADE,
  CONSTRAINT `collectionPost_post_postID_fk`
  FOREIGN KEY (`postID`) REFERENCES `post` (`postID`)
    ON DELETE CASCADE
);


CREATE TABLE `userFile`
(
  `userID` INT NOT NULL,
  `fileID` INT NOT NULL,
  `updatedAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    ON UPDATE CURRENT_TIMESTAMP,
  `createdAt` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT `userFile_file_fileID_fk`
  FOREIGN KEY (`fileID`) REFERENCES `file` (`fileID`),
  CONSTRAINT `userFile_user_userID_fk`
  FOREIGN KEY (`userID`) REFERENCES `user` (`userID`)
    ON DELETE CASCADE
);
