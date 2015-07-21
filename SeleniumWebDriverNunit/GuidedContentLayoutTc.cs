using System;
using System.Collections.Generic;
using NUnit.Framework;
using OpenQA.Selenium;

namespace SeleniumWebDriverNunit
{
    [TestFixture]
    public class GuidedContentLayoutTc : AbstractGuidedHelpTc
    {
        [TestFixtureSetUp]
        public override void SetUpTestFixture()
        {
            const String url = @"/GuidedHelp/Modem-Motorola-SBG6580-Hopper913/GuidedContentUnit.html";
            const String title = @"Modem Motorola SBG6580 Hopper913";
            ExpectedValues.Create(BaseUrl, url, title, false);

            base.SetUpTestFixture();
        }

        // TODO: Check that each anchor goes somewhere
        // TODO: Replace this test once we can walk all possible exitPaths
        [Test]
        public void WalkTheTree()
        {
            // Create a list of all the states
            // For each state, determine next states, then click each state, clicking previous, verify are in original state
            // Verify that each state was visited 
            foreach (IWebElement state in States)
            {
                IList<string> nextStates = new List<string>();
                IList<IWebElement> anchors = state.FindElements(By.CssSelector("a"));

                Driver.Navigate().GoToUrl(ExpectedValues.Instance.FullUrl + "#/" + state.GetAttribute("id"));
                FindCurrentState();

                foreach (IWebElement anchor in anchors)
                {
                    if (anchor.Text.Equals(GuidedHelpConstants.Back))
                    {
                        // Back button will get tested later
                        continue;
                    }
                    var goToState = GetGoToStateId(anchor);
                    nextStates.Add(goToState);

                    NavigateToState(anchor);

                    GoBackToPreviousState();
                }
            }
        }

        private void GoBackToPreviousState()
        {
            FindCurrentState();
            String oldPreviousStateId = PreviousStateId;
            String oldCurrentStateId = CurrentStateId;

            Console.WriteLine("GoBackToPreviousState currentState=" + CurrentStateId + " previousState=" +
                              PreviousStateId);

            IWebElement anchor = CurrentState.FindElement(By.LinkText(GuidedHelpConstants.Back));

            NavigateToState(anchor);

            FindCurrentState();

            var msg = "The test harness keeps track of the current and previous states. ";
            msg += "After clicking the back button the two should be switched.";
            Assert.AreEqual(oldPreviousStateId, CurrentStateId, "oldPreviousStateId != currentStateId. " + msg);
            Assert.AreEqual(oldCurrentStateId, PreviousStateId, "oldCurrentStateId != previousStateId. " + msg);
        }

        private HashSet<String> exitPaths = new HashSet<string>();
        private HashSet<String> cyclicPaths = new HashSet<string>();

        [Test]
        public void AllPathsEndInExit()
        {
            String currentPath = CurrentState.GetAttribute("id") + "->";
            FollowChild(CurrentState, currentPath, 0);

            Console.WriteLine("\n\nThe paths that reach the Exit state");
            foreach (String path in exitPaths)
            {
                Console.WriteLine(path);
            }

            Console.WriteLine("\n\nThe paths that loop to a previously seen path. Check with author to see if loops are OK.");
            foreach (String path in cyclicPaths)
            {
                Console.WriteLine(path);
            }
            
            if (AreLoopsAllowed)
            {
                Assert.IsEmpty(cyclicPaths, "\"" + Driver.Title + "\" has one or more cycles/circles");
            }
        }

        private void FollowChild(IWebElement state, String currentPath, int level)
        {
            // In case of a programming error
            const int tooDeep = 100;
            if (level > tooDeep)
            {
                Assert.Fail("Recursive level of " + tooDeep + " reached, programming error");
            }

            String stateId = state.GetAttribute("id");
            Console.WriteLine("FollowChild(" + level + ") visiting state \"" + stateId + "\" currentPath=" + currentPath);

            if (stateId.Equals(GuidedHelpConstants.Exit))
            {
                //Console.WriteLine("Exit encountered on state " + stateId);
                Console.WriteLine("Final Path=" + currentPath);
                exitPaths.Add(currentPath);
                return;
            }

            int nextLevel = level + 1;
            IList<IWebElement> anchors = state.FindElements(By.CssSelector("a"));
            foreach (IWebElement anchor in anchors)
            {
                String goToStateId = GetGoToStateId(anchor);
                if ((GuidedHelpConstants.PreviousState.Equals(goToStateId)))
                {
                    continue;
                }

                if (currentPath.Contains(goToStateId))
                {
                    Console.WriteLine("Cycle encountered. Already seen state " + stateId);
                    Console.WriteLine("Path=" + currentPath);
                    cyclicPaths.Add(currentPath);
                    return;
                }

                IWebElement nextState = Driver.FindElement(By.Id(goToStateId));
                String copyOfCurrentPath = String.Copy(currentPath) + "->" + nextState.GetAttribute("id");
                FollowChild(nextState, copyOfCurrentPath, nextLevel);
            }
        }

    }
}
