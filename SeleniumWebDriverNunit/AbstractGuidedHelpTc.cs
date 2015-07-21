using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using NUnit.Core;
using NUnit.Framework;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Remote;
using OpenQA.Selenium.Support.Extensions;
using OpenQA.Selenium.Support.UI;

namespace SeleniumWebDriverNunit
{
    // TODO: Learn about ExpectedConditions and see where we can improve the tests

    // For each state 

    // - Done - Verify we are on the correct state. 
    // - Done - Verify all other states are disabled
    // - Done - Verify the correct state is now active
    // - Done - Verify that the text area doesn't run on (no scrollbar)
    // - Done - Verify that the image doesn't run on (no scrollbar)
    // - Verify that the progress bar doesn't clip the navigation buttons
    // - Verify that the progress bar has the right icons
    // - Done - Click the Next state
    // - Done - Verify that the URL hash has the next state
    // - TODO: Verify that the Previous button goes to the 1st state, URL hash shows that it is the previous state
    // - TODO: Verify back button on the browser goes back
    // - Verify that the image loaded correctly, this may already be checked by the allCanvasDrawn boolean in diagram_services.js
    // - Verify the structure of each state - correct number and placement of divs, canvas, etc.
    // - Verify browser back button works and goes to previous GuidedHelp state
    // - Verify if there is a background-image does it have a valid src attribute and is there a canvas
    // - Verify if there is a overlay-image does it have 
    //      - a valid src, x and y attributes
    //      - is there is a background-image and a canvas
    // - Verify if there is a video that there is no canvas
    // - Verify if video then proper behavior when leaving state

    [TestFixture]
    public abstract class AbstractGuidedHelpTc
    {
        protected String BaseUrl = "http://localhost:8722";

        protected IWebDriver Driver;
        protected StringBuilder VerificationErrors;
        protected bool AcceptNextAlert = true;
        protected IWebElement Body;
        protected IList<IWebElement> States;
        protected String IntroState;

        public IWebElement CurrentState;
        public String CurrentStateId { get { return CurrentState.GetAttribute("id"); } }

        public IWebElement PreviousState;
        public String PreviousStateId { get { return PreviousState.GetAttribute("id"); } }

        // Allow tests to turn off the checks in the TestFixtureSetup to do boundary validation
        protected bool PerformBasicChecks = true;

        // Common error messages to allow exception testing
        protected String UnexpectedIntroErrorMsg = "Unexpected introState";
        protected String IncorrectTitleErrorMsg = "Incorrect title or title not found";
        protected String BadIsArticleErrorMsg = "Invalid isArticle attribute";
        protected String FailedToFindCurrentStateErrorMsg = "Unable to find current state with url";
        protected String MaxHeightMsgPrefix = "Max Height of " + GuidedHelpConstants.MaxImageHeight + " exceeded. ";

        protected bool AreLoopsAllowed = false;

        [TestFixtureSetUp]
        public virtual void SetUpTestFixture()
        {
            try
            {
                Driver = new FirefoxDriver();

                VerificationErrors = new StringBuilder();
                Driver.Navigate().GoToUrl(ExpectedValues.Instance.FullUrl);

                WaitForElement(By.Id(GuidedHelpConstants.StatesId));

                // TODO: Do we want to check that the spinning image is displayed until the diagrams are drawn?

                States = Driver.FindElements(MakeCssSelector(GuidedHelpConstants.StateClass));

                if (PerformBasicChecks)
                {
                    FindCurrentState();

                    // Can't guarantee order of the tests running so do some upfront checking and setup
                    ValidateHead();

                    ValidateBody();
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("SetupTesetFixture failed err=" + e.Message);
                Console.WriteLine(e.StackTrace);

                // If there are failures during the setup then the browser is shutdown
                QuitDriver();
                throw;
            }
        }

        protected void QuitDriver()
        {
            if (Driver != null)
            {
                Driver.Quit();
            }
        }

        protected void WaitForDiagramsReady()
        {
            IWebElement statesElement = Driver.FindElement(By.Id("States"));
            String ngShowFunc = statesElement.GetAttribute("ng-show");
            Console.WriteLine("ng-show=" + ngShowFunc);

            WebDriverWait wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(10));
            wait.Until<IWebElement>((d) =>
            {
                try
                {
                    // Kudos: http://www.dzone.com/articles/webdriver-and-angularjs
                    // This should work but doesn't. scope is a function but scope() is undefined
                    // It could be related to $compileProvider.debugInfoEnabled(false)
                    String js = "return angular.element(arguments[0]).scope().areDiagramsReady();";
                    Console.WriteLine("js=" + js);
                    String result =
                        Driver.ExecuteJavaScript<String>(js, statesElement);
                    Console.WriteLine("result=" + result);

                    bool areDiagramsReady = Boolean.Parse(result);
                    if (areDiagramsReady)
                    {
                        Console.WriteLine("areDiagramsReady=" + areDiagramsReady);
                        return statesElement;
                    }
                }
                catch (AssertionException ae)
                {
                    Console.WriteLine("ae=" + ae);
                }
                return null;
            });

        }

        protected void ValidateHead()
        {
            // Assert the title is present and correct
            // TODO: Figure out how to pass in the title, introState, etc.
            Assert.AreEqual(ExpectedValues.Instance.Title, Driver.Title, IncorrectTitleErrorMsg);
        }

        protected void ValidateBody()
        {
            ValidateIntroState();

            ValidateIsArticle();

            ValidateAtLeastOnState();
        }

        private void ValidateAtLeastOnState()
        {
            Assert.Greater(States.Count, 1, "Invalid number of states");
        }

        protected void ValidateIntroState()
        {
            // Find the introduction state
            Body = Driver.FindElement(By.CssSelector("body"));
            String dataNgInit = Body.GetAttribute("data-ng-init");
            IntroState = dataNgInit.Replace("introState='", "");
            IntroState = Regex.Replace(IntroState, @"'.*", "");
            Assert.IsNotEmpty(dataNgInit, GuidedHelpConstants.DataNgInitAttr + " is incorrect");
            Assert.AreEqual(IntroState, ExpectedValues.Instance.IntroState, UnexpectedIntroErrorMsg);
        }

        protected void ValidateIsArticle()
        {
            // Find the introduction state
            Body = Driver.FindElement(By.CssSelector("body"));
            String dataNgInit = Body.GetAttribute("data-ng-init");

            if (ExpectedValues.Instance.IsTestingArticle)
            {
                Assert.IsTrue(dataNgInit.Contains("isArticle=true"), BadIsArticleErrorMsg);
            }
        }


        protected By MakeCssSelector(String className, String qualifier = ".")
        {
            return By.CssSelector(qualifier + className);
        }

        [TestFixtureTearDown]
        public void TeardownTestFixture()
        {
            try
            {
                QuitDriver();
            }
            // ReSharper disable once EmptyGeneralCatchClause
            catch (Exception)
            {
                // Ignore errors if unable to close the browser
            }
            Assert.AreEqual("", VerificationErrors.ToString(), "TestFixtureTearDown failure");
        }

        public void CanvasSizeIsCorrect(IWebElement stateDiv)
        {
            IList<IWebElement> videoList = stateDiv.FindElements(By.CssSelector("video"));
            if (videoList.Count > 0)
            {
                return;
            }

            String parentStateId = stateDiv.GetAttribute("id");
            Console.WriteLine("CanvasSizeIsCorrect stateId=" + parentStateId);

            IList<IWebElement> canvasList = stateDiv.FindElements(By.CssSelector("canvas"));
            Assert.AreEqual(1, canvasList.Count, " Incorrect number of canvas for state " + parentStateId);

            IWebElement canvas = canvasList[0];
            Assert.LessOrEqual(Convert.ToInt32(canvas.GetAttribute("width")), GuidedHelpConstants.MaxImageWidth,
                    " canvas incorrect width for state " + parentStateId);

            Assert.LessOrEqual(Convert.ToInt32(canvas.GetAttribute("height")), GuidedHelpConstants.MaxImageHeight,
                " canvas incorrect height for state " + parentStateId);
        }

        protected IWebElement FindParentStateDiv(IWebElement startingElement)
        {
            IWebElement stateDiv = startingElement;
            while (true)
            {
                stateDiv = stateDiv.FindElement(By.XPath(".."));
                if (stateDiv == null)
                {
                    Assert.Fail("no state div found with class " + GuidedHelpConstants.StateClass + " from element " +
                                startingElement.TagName);
                }
                String stateDivClass = stateDiv.GetAttribute("class");
                if (stateDivClass.Contains(GuidedHelpConstants.StateClass))
                {
                    break;
                }
            }
            return stateDiv;
        }

        protected void WaitForElement(By by, int timeoutPeriodInSecs = 30)
        {
            WebDriverWait wait = new WebDriverWait(Driver, TimeSpan.FromSeconds(timeoutPeriodInSecs));
            wait.Until(ExpectedConditions.ElementExists(by));
        }

        protected String ExtractCurrentStateId(String url)
        {
            return Regex.Replace(url, ".*#/", "");
        }

        protected void NavigateHelp()
        {
            int index = 0;
            while (true)
            {
                FindCurrentState();

                Console.WriteLine("Current state " + CurrentStateId);

                // We are on the first step
                if (ExtractCurrentStateId(Driver.Url).Equals(IntroState))
                {
                    // - If the page just loaded, verify we are on the first state and there is only a Next state
                    Console.WriteLine("About to test introState \"" + CurrentStateId + "\"");
                    Assert.AreEqual(CurrentStateId, ExpectedValues.Instance.IntroState, "HTML failure");
                    String expectedUrl = ExpectedValues.Instance.FullUrl + "#/" + CurrentStateId;
                    Assert.AreEqual(Driver.Url, expectedUrl, "incorrect URL");
                }

                ValidateStateVisibility();

                // - Verify that the text area fits (no scrollbar)
                ValidateNoScroll(GuidedHelpConstants.TextClass);

                ValidateNoScroll(GuidedHelpConstants.DiagramWrapClass);

                CanvasSizeIsCorrect(CurrentState);

                //ValidateImage(CurrentState);

                //ValidateVideo(CurrentState);

                IList<IWebElement> anchorElements = CurrentState.FindElements(By.CssSelector("a"));
                Console.WriteLine("number of anchors=" + anchorElements.Count);

                int clickIndex;
                if (ValidatePreviousNextAnchors(index, anchorElements, out clickIndex)) break;

                NavigateToState(anchorElements[clickIndex]);

                index++;
            }

            // Walk the Previous button to the beginning of the article
            while (!CurrentStateId.Equals(IntroState))
            {
                FindCurrentState();

                Console.WriteLine("Current state " + CurrentStateId);

                // Find the Previous button, click it
                String linkText = GuidedHelpConstants.Previous;
                IList<IWebElement> anchorElements = CurrentState.FindElements(By.LinkText(linkText));
                int expectedPreviousCount = 1;
                if (CurrentStateId.Equals(IntroState))
                {
                    expectedPreviousCount = 0;
                }
                Assert.AreEqual(anchorElements.Count, expectedPreviousCount, "Incorrect number of \"" + linkText + "\"");

                if (CurrentStateId.Equals(IntroState))
                {
                    break;
                }

                NavigateToState(anchorElements[0]);

                index--;
            }

        }

        // Kudos: https://stackoverflow.com/questions/4052304/selenium-checking-image-validity
        // TODO: need to write a test case to validate this method is working correctly.
        protected void ValidateVideo(IWebElement state)
        {
            IList<IWebElement> videos = state.FindElements(By.CssSelector("video"));
            foreach (IWebElement video in videos)
            {
                object result = ((IJavaScriptExecutor)Driver).ExecuteScript("return arguments[0].complete && " +
                   "typeof arguments[0].naturalWidth != \"undefined\" && " +
                   "arguments[0].naturalWidth > 0", video);

                if (result is bool)
                {
                    bool loaded = (Boolean)result;
                    Console.WriteLine(loaded);
                    Assert.IsTrue(loaded, "Video not loaded correctly: " + video.GetAttribute("src"));
                }
                else
                {
                    Assert.Fail("Non-bool returned from javascript query result is of type " + result.GetType());
                }
            }
        }

        // Kudos: https://stackoverflow.com/questions/4052304/selenium-checking-image-validity
        // TODO: need to write a test case to validate this method is working correctly.
        protected void ValidateImage(IWebElement state)
        {
            IList<IWebElement> images = state.FindElements(By.CssSelector("img"));
            foreach (IWebElement image in images)
            {
                object result = ((IJavaScriptExecutor)Driver).ExecuteScript("return arguments[0].complete && " +
                   "typeof arguments[0].naturalWidth != \"undefined\" && " +
                   "arguments[0].naturalWidth > 0", image);

                if (result is bool)
                {
                    bool loaded = (Boolean)result;
                    Console.WriteLine(loaded);
                    Assert.IsTrue(loaded, "Image not loaded correctly: " + image.GetAttribute("src"));
                }
                else
                {
                    Assert.Fail("Non-bool returned from javascript query result is of type " + result.GetType());
                }
            }
        }

        // Validate that the element is not clipped
        protected void ValidateNoScroll(String selector, String selectorType = ".")
        {
            String cssSelector = selectorType + selector;
            By byCssSelector = By.CssSelector(cssSelector);

            Console.WriteLine("Testing " + selector + " currentState " + CurrentState.GetAttribute("id") + " class=" + CurrentState.GetAttribute("class"));
            IWebElement element = CurrentState.FindElement(byCssSelector);

            String heightAsString = element.GetCssValue("height");
            heightAsString = Regex.Replace(heightAsString, "px|%|auto", "");
            if (heightAsString.Length <= 0)
            {
                heightAsString = "0";
            }
            Console.WriteLine("currentState=" + CurrentState + " heightAsString=" + heightAsString);
            int cssHeight = Convert.ToInt32(heightAsString);
            int scrollHeight = Convert.ToInt32(element.GetAttribute("scrollHeight"));

            IJavaScriptExecutor js = (IJavaScriptExecutor)Driver;
            String script = "return $('#" + CurrentStateId + " " + cssSelector + "').innerHeight();";
            int innerHeight = Convert.ToInt32(js.ExecuteScript(script));

            Console.WriteLine("cssHeight=" + cssHeight + " scrollHeight= " + scrollHeight + " innerHeight=" + innerHeight);

            Assert.LessOrEqual(scrollHeight, innerHeight, MakeAssertMsg(cssSelector, CurrentStateId));
            Assert.LessOrEqual(innerHeight, GuidedHelpConstants.MaxImageHeight, MaxHeightMsgPrefix + MakeAssertMsg(selector, CurrentStateId));
        }

        protected String MakeAssertMsg(String cssSelector, String stateId)
        {
            return cssSelector + " did not fit in state " + stateId;
        }

        protected void NavigateToState(IWebElement clickElement)
        {
            var goToState = GetGoToStateId(clickElement);
            if (!ExpectedValues.Instance.IsTestingArticle && GuidedHelpConstants.PreviousState.Equals(goToState))
            {
                goToState = PreviousStateId;
            }

            Console.WriteLine("Current state " + CurrentStateId + " about to click " + clickElement.Text +
                              " to go to state " + goToState);
            clickElement.Click();
            ExpectedConditions.ElementIsVisible(By.Id(goToState));

            String expectedCurrentStateId = ExtractCurrentStateId(Driver.Url);
            Assert.AreEqual(goToState, expectedCurrentStateId, "The anchor link did not go to the correct state");
        }

        protected static string GetGoToStateId(IWebElement anchorElement)
        {
            String goToState = anchorElement.GetAttribute("ng-click");
            goToState = Regex.Replace(goToState, @".*\('", "");
            goToState = Regex.Replace(goToState, @"'\).*", "");
            return goToState;
        }

        protected void FindCurrentState()
        {
            foreach (IWebElement aState in States)
            {
                if (Driver.Url.Contains(aState.GetAttribute("id")))
                {
                    PreviousState = CurrentState;
                    CurrentState = aState;
                    return;
                }
            }

            Assert.Fail(FailedToFindCurrentStateErrorMsg + " " + Driver.Url);
        }

        protected void ValidateStateVisibility()
        {
            foreach (IWebElement state in States)
            {
                // Validate other states are hidden
                String stateClass = state.GetAttribute("class");
                String stateId = state.GetAttribute("id");
                var haveMsg = "Expected State " + stateId + " to have class {0} currentState=" + CurrentStateId;
                var notHaveMsg = "Expected State " + stateId + " to not have class {0} currentState=" + CurrentStateId;
                String expectedClassDirective;
                if (state.Equals(CurrentState))
                {
                    expectedClassDirective = GuidedHelpConstants.NgShowClass;
                    Assert.IsFalse(stateClass.Contains(expectedClassDirective),
                        String.Format(notHaveMsg, expectedClassDirective));

                    expectedClassDirective = GuidedHelpConstants.NgHideClass;
                    Assert.IsFalse(stateClass.Contains(expectedClassDirective),
                        String.Format(notHaveMsg, expectedClassDirective));
                }
                else
                {
                    expectedClassDirective = GuidedHelpConstants.NgShowClass;
                    Assert.IsFalse(stateClass.Contains(expectedClassDirective),
                        String.Format(notHaveMsg, expectedClassDirective));

                    expectedClassDirective = GuidedHelpConstants.NgHideClass;
                    Assert.IsTrue(stateClass.Contains(expectedClassDirective),
                        String.Format(haveMsg, expectedClassDirective));
                }
            }
        }

        protected bool ValidatePreviousNextAnchors(int index, IList<IWebElement> anchorElements, out int clickIndex)
        {
            String msg = "Invalid number of anchors or buttons for state \"" + CurrentStateId + "\"";

            clickIndex = 0;
            if (index == 0)
            {
                Assert.AreEqual(anchorElements.Count, 1, msg);
                Assert.AreEqual(anchorElements[0].Text, GuidedHelpConstants.Next, "Invalid button");
            }
            else if (index < States.Count - 1)
            {
                Assert.AreEqual(anchorElements.Count, 2, msg);

                Assert.AreEqual(anchorElements[0].Text, GuidedHelpConstants.Previous, "Invalid button");
                Assert.AreEqual(anchorElements[1].Text, GuidedHelpConstants.Next, "Invalid button");

                clickIndex = 1;
            }
            else
            {
                Assert.AreEqual(anchorElements.Count, 1, msg);

                Assert.AreEqual(anchorElements[0].Text, GuidedHelpConstants.Previous, "Invalid button");

                return true;
            }
            return false;
        }

        protected bool IsElementPresent(By by)
        {
            try
            {
                Driver.FindElement(by);
                return true;
            }
            catch (NoSuchElementException)
            {
                return false;
            }
        }

        protected bool IsAlertPresent()
        {
            try
            {
                Driver.SwitchTo().Alert();
                return true;
            }
            catch (NoAlertPresentException)
            {
                return false;
            }
        }

        protected string CloseAlertAndGetItsText()
        {
            try
            {
                IAlert alert = Driver.SwitchTo().Alert();
                string alertText = alert.Text;
                if (AcceptNextAlert)
                {
                    alert.Accept();
                }
                else
                {
                    alert.Dismiss();
                }
                return alertText;
            }
            finally
            {
                AcceptNextAlert = true;
            }
        }

        protected void OpenMoreDialog()
        {
            Driver.FindElement(By.CssSelector("#" + CurrentStateId + " > div.helpviewerallcontrols > img.imgSettings.ng-scope")).Click();
        }

        protected void CloseMoreDialog()
        {
            Driver.FindElement(By.CssSelector("#" + CurrentStateId + " > div.helpviewerallcontrols > img.imgSettings.ng-scope")).Click();
        }
    }
}