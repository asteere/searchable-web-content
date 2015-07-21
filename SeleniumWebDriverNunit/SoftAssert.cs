using System;
using System.Runtime.CompilerServices;
using NUnit.Framework;

namespace SeleniumWebDriverNunit
{
    /**
     * Nunit wrapper for Selenium 
     * - to allow handling assert that should throw when testing the help test framework
     * - special assertion handling if we wanted to implement a verify
     */
    class SoftAssert
    {
        public static void Fail(String msg,
            String expectedMsg = null,
            [CallerMemberName] string callingMethod = "",
            [CallerFilePath] string callingFilePath = "",
            [CallerLineNumber] int callingFileLineNumber = 0)
        {
            String location = FormatLocation(callingFilePath, callingMethod, callingFileLineNumber);
            String completeMsg = msg + location;

            try
            {
                // Assert the title is present and correct
                // TODO: Figure out how to pass in the title, introState, etc.

                Assert.Fail(completeMsg);
            }
            catch (AssertionException)
            {
                if (CheckException(expectedMsg, location, completeMsg))
                {
                    throw;
                }
            }
        }

        public static void IsNotNull(Object actual, String msg,
            String expectedMsg = null,
            [CallerMemberName] string callingMethod = "",
            [CallerFilePath] string callingFilePath = "",
            [CallerLineNumber] int callingFileLineNumber = 0)
        {
            String location = FormatLocation(callingFilePath, callingMethod, callingFileLineNumber);
            String completeMsg = msg + location;

            try
            {
                // Assert the title is present and correct
                // TODO: Figure out how to pass in the title, introState, etc.

                Assert.IsNotNull(actual, completeMsg);
            }
            catch (AssertionException)
            {
                if (CheckException(expectedMsg, location, completeMsg))
                {
                    throw;
                }
            }
        }

        public static void IsNotEmpty(String actual, String msg,
            String expectedMsg = null,
            [CallerMemberName] string callingMethod = "",
            [CallerFilePath] string callingFilePath = "",
            [CallerLineNumber] int callingFileLineNumber = 0)
        {
            String location = FormatLocation(callingFilePath, callingMethod, callingFileLineNumber);
            String completeMsg = msg + location;

            try
            {
                // Assert the title is present and correct
                // TODO: Figure out how to pass in the title, introState, etc.

                Assert.IsNotEmpty(actual, completeMsg);
            }
            catch (AssertionException)
            {
                if (CheckException(expectedMsg, location, completeMsg))
                {
                    throw;
                }
            }
        }

        public static void AreEqual(Object expected, Object actual, String msg,
            String expectedMsg = null,
            [CallerMemberName] string callingMethod = "",
            [CallerFilePath] string callingFilePath = "",
            [CallerLineNumber] int callingFileLineNumber = 0)
        {
            String location = FormatLocation(callingFilePath, callingMethod, callingFileLineNumber);
            String completeMsg = msg + location;

            try
            {
                // Assert the title is present and correct
                // TODO: Figure out how to pass in the title, introState, etc.

                Assert.AreEqual(expected, actual, completeMsg);
            }
            catch (AssertionException)
            {
                if (CheckException(expectedMsg, location, completeMsg))
                {
                    throw;
                }
            }
        }

        public static void LessOrEqual(int expected, int actual, String msg,
            String expectedMsg = null,
            [CallerMemberName] string callingMethod = "",
            [CallerFilePath] string callingFilePath = "",
            [CallerLineNumber] int callingFileLineNumber = 0)
        {
            String location = FormatLocation(callingFilePath, callingMethod, callingFileLineNumber);
            String completeMsg = msg + location;

            try
            {
                // Assert the title is present and correct
                // TODO: Figure out how to pass in the title, introState, etc.

                Assert.LessOrEqual(expected, actual, completeMsg);
            }
            catch (AssertionException)
            {
                if (CheckException(expectedMsg, location, completeMsg))
                {
                    throw;
                }
            }
        }


        public static void Greater(int expected, int actual, String msg,
            String expectedMsg = null,
            [CallerMemberName] string callingMethod = "",
            [CallerFilePath] string callingFilePath = "",
            [CallerLineNumber] int callingFileLineNumber = 0)
        {
            String location = FormatLocation(callingFilePath, callingMethod, callingFileLineNumber);
            String completeMsg = msg + location;

            try
            {
                // Assert the title is present and correct
                // TODO: Figure out how to pass in the title, introState, etc.

                Assert.Greater(expected, actual, completeMsg);
            }
            catch (AssertionException)
            {
                if (CheckException(expectedMsg, location, completeMsg))
                {
                    throw;
                }
            }
        }


        public static void IsTrue(bool actual, String msg,
            String expectedMsg = null,
            [CallerMemberName] string callingMethod = "",
            [CallerFilePath] string callingFilePath = "",
            [CallerLineNumber] int callingFileLineNumber = 0)
        {
            String location = FormatLocation(callingFilePath, callingMethod, callingFileLineNumber);
            String completeMsg = msg + location;

            try
            {
                // Assert the title is present and correct
                // TODO: Figure out how to pass in the title, introState, etc.

                Assert.IsTrue(actual, completeMsg);
            }
            catch (AssertionException)
            {
                if (CheckException(expectedMsg, location, completeMsg))
                {
                    throw;
                }
            }
        }

        public static void IsFalse(bool actual, String msg,
            String expectedMsg = null,
            [CallerMemberName] string callingMethod = "",
            [CallerFilePath] string callingFilePath = "",
            [CallerLineNumber] int callingFileLineNumber = 0)
        {
            String location = FormatLocation(callingFilePath, callingMethod, callingFileLineNumber);
            String completeMsg = msg + location;

            try
            {
                // Assert the title is present and correct
                // TODO: Figure out how to pass in the title, introState, etc.

                Assert.IsFalse(actual, completeMsg);
            }
            catch (AssertionException)
            {
                if (CheckException(expectedMsg, location, completeMsg))
                {
                    throw;
                }
            }
        }

        private static bool CheckException(string expectedMsg, string location, string completeMsg)
        {
            if (ExpectedValues.Instance.IsTestingTheTestFramework)
            {
                if (expectedMsg != null)
                {
                    String completeExpectedMsg = expectedMsg + location;
                    Assert.AreEqual(completeMsg, completeExpectedMsg, "Expected error message incorrect");
                }
                return false;
            }
            return true;
        }

        private static string FormatLocation(string callingFilePath, string callingMethod, int callingFileLineNumber)
        {
            return " " + callingFilePath + "." + callingMethod + ":" + callingFileLineNumber;
        }
    }
}
