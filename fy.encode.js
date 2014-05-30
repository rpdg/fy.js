;(function(){
	var cryptTable = " ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789	!@#$%^&*()`'-=[];,./?_+{}|:<>~";
	var cryptLength = cryptTable.length - 1; //93 Chars
	var escapeChar = cryptTable.charAt(cryptLength); // The escape code is ~

	var lineFeed = "\n"; //The linefeed char - escaped to double escapeChar
	var doubleQuote = '"'; //Double quotes are escaped to ~'

	/* This function uses the key and encrypts a string with the password */
	// Encryption strips all linefeeds - but they are replaced upon decrypt
	fy.encode = function(input, password){
		var inChar, inValue, outValue;

		var output = "";
		var arNumberPw = [];

		var pwLength = password.length;
		var inLength = input.length;

		var stopStatus = Math.round(inLength / 10);

		var pwIndex = 0 ;

		for (; pwIndex < pwLength; pwIndex++) {
			arNumberPw[pwIndex] = cryptTable.indexOf(password.charAt(pwIndex));
		}

		/* XOR all the chars */
		pwIndex = 0 ;
		for (var inIndex = 0; inIndex < inLength; inIndex++, pwIndex++) {
			if (pwIndex == pwLength) //Make sure the password index is in range
			{
				pwIndex = 0;
			}

			/* Get the input */

			inChar = input.charAt(inIndex);
			inValue = cryptTable.indexOf(inChar);

			/* Conversion/Escaping Sequence */
			// If the outValue is in the character map, encode it
			// If the encoded value is outside the character map, escape it
			// Else convert it to a char
			// If the input char is a linefeed, escape it
			// If the input char is a double quote, escape it
			// If the input char wasn't found, pass it through

			if (inValue != -1) {
				outValue = arNumberPw[pwIndex] ^ inValue;
				if (outValue >= cryptLength) {
					outValue = escapeChar + cryptTable.charAt(outValue - cryptLength);
				}
				else outValue = cryptTable.charAt(outValue);
			}
			else if (inChar == "\r") {
				outValue = escapeChar + escapeChar;
				if (input.charAt(inIndex + 1) == "\n") inIndex++; //If it is a 2 char linefeed skip next one
			}
			else if (inChar == "\n") {
				outValue = escapeChar + escapeChar;
			}
			else if (inChar == doubleQuote) {
				outValue = escapeChar + "'";
			}
			else {
				outValue = inChar;
			}

			output += outValue; //Output the char


		}

		return output;
	};

	/* This function uses the key and encrypts a string with the password */
	fy.decode = function(input, password){
		var inChar, inValue, outValue, escape = false;

		var output = "";
		var arNumberPw = [];

		var pwLength = password.length;
		var inLength = input.length;


		var pwIndex = 0 ;
		for (; pwIndex < pwLength; pwIndex++) {
			arNumberPw[pwIndex] = cryptTable.indexOf(password.charAt(pwIndex));
		}

		/* XOR all the chars */
		pwIndex = 0 ;
		for (var inIndex = 0; inIndex < inLength; inIndex++, pwIndex++) {
			if (pwIndex >= pwLength) //Make sure the password index is in range
			{
				pwIndex = 0;
			}

			/* Get the input */
			inChar = input.charAt(inIndex);
			inValue = cryptTable.indexOf(inChar);

			/* Decrypting/Unescaping Sequence */
			// If the input char wasn't found, pass it through (error checking)
			// If the last char was an escapeChar
			//And the input is an escapeChar, output a linefeed
			//Or the input is a single quote, output a double quote
			//Otherwise just add the cryptLength to the inValue
			//Turn escape off
			// If the inValue hasn't been coverted to an outValue yet
			// If the inChar is an escapeChar, turn escape on
			// Otherwise decrypt the encrypted character

			if (inValue == -1) {
				outValue = inChar;
			}

			else if (escape) {
				if (inValue == cryptLength) {
					outValue = lineFeed;
					inValue = -1;
				}
				else if (inChar == "'") {
					outValue = doubleQuote;
					inValue = -1;
				}
				else {
					inValue += cryptLength;
				}
				escape = false;
			}
			else if (inValue == cryptLength) {
				escape = true;
				pwIndex--; //Stop the password from incrementing
				outValue = "";
				inValue = -1;
			}

			if (inValue != -1) {
				outValue = cryptTable.charAt(arNumberPw[pwIndex] ^ inValue);
			}

			/* Output */

			output += outValue;

		}

		return output;
	} ;

	//Encrypt JS Object Value
	//dependence: fy.encode
	fy.encryptObject = function(obj , password){
		var key ;
		for(key in obj)
			if(typeof obj[key] === "string")
				obj[key] = fy.encode(obj[key], password) ;

		return obj ;
	};

})();

