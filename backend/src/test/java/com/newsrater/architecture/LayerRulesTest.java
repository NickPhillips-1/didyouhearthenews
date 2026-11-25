package com.newsrater.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packages = "com.newsrater", importOptions = ImportOption.DoNotIncludeTests.class)
class LayerRulesTest {

    @ArchTest
    static final ArchRule controllers_do_not_call_repositories =
            noClasses()
                    .that().resideInAPackage("..controller..")
                    .should().dependOnClassesThat().resideInAPackage("..repository..")
                    .because("HTTP stays in the controller and calls StoryService. Repositories are for services.");

    @ArchTest
    static final ArchRule services_do_not_depend_on_controllers =
            noClasses()
                    .that().resideInAPackage("..service..")
                    .should().dependOnClassesThat().resideInAPackage("..controller..")
                    .because("services do not import the HTTP layer.");
}
