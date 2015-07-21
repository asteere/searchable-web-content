using System;
using System.Collections.Generic;
using NUnit.Framework;
using OpenQA.Selenium;

namespace SeleniumWebDriverNunit
{
    [TestFixture]
    public class GuidedArticleTc : AbstractGuidedHelpTc
    {
        [TestFixtureSetUp]
        public override void SetUpTestFixture()
        {
            const String url = @"/GuidedHelp/005FFABC-4290-43B9-8ECE-A369005EAE9B/GuidedArticle.html";
            const String title = @"GA: Troubleshoot Network Connection";
            ExpectedValues.Create(BaseUrl, url, title);

            base.SetUpTestFixture();
        }

        [Test]
        public void ArticleRegression()
        {
            NavigateHelp();
        }
    }
}
