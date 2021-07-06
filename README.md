# Custom Control for the Work Item Form

[Learn how to build your own custom control for the work item form.](https://www.visualstudio.com/en-us/docs/integrate/extensions/develop/custom-control)

![Control](img/hitCountControl.png)

### Usage ###

1. Download the repository.
2. Open the Command Prompt and change to the directory where you cloned the project. 
3. Make This Steps : 
    1. Run `npm install` to install required dependencies.
    2. Run `npm install -g grunt` to install a global copy of grunt.
    3. Run `npm install -g tfx-cli`
    4. Check the category value in the 'vss-extension.json' file 
        1. "Plan and track" for TFS 2017
        2. "Azure Boards" for TFS 2019
    5. Run `grunt package-dev`.
    6. Navigate to your TFS. and Go to Marketplace. 
    7. Click "Browse local extensions".
    8. Scroll down and click on the "Manage Extensions".
    9. Click "Upload new extension".
    10. Drag and Drop the generated file from your packaged project (vsix). 
    11. Click "Upload".
    12. Hover over the extension when it appears in the list, and click "Install".

You have now installed the extension inside your collection.  
You are now able to put the control in the work item form.

A work item type is defined by XML, including the layout of the work item form.  
As part of the walkthrough, you will add the control to the layout.  
[Read more information on WebLayout XML](https://www.visualstudio.com/docs/work/reference/weblayout-xml-elements).  
In this example, we will add the control to the Agile "user story".

1.  Open the `Developer Command Prompt`.  Export the XML file to your desktop with command shown below.
    ```
    witadmin exportwitd /collection:CollectionURL /p:Project /n:TypeName /f:FileName
    ```
2. This creates a file in the directory that you specified.  Inside this file, navigate to the section called "Work Item Extensions".  This section shows the documentation of the control such as the inputs and ids.  All this information was defined in the manifest, *vss-extension.json*.

    ```xml
        <!--**********************************Work Item Extensions***************************

    Extension:
        Name: Action-Button
        Id: AviHadad.Action-Button

        Control contribution:
            Id: AviHadad.Action-Button.ActionButton
            Description: Runs a code from the buttonAction.dll file.
            Inputs:
                Id: DataTransfer
                Description: The field pass Data from the work item to the Action Code.
			    Type: WorkItemField
			    Field Type: Integer; Double; String
			    Data Type: String
			    IsRequired: true

                Id: TargetType
			    Description: The field pass the target work item type.
			    Type: WorkItemField
			    Field Type: Integer; Double; String
			    Data Type: String
			    IsRequired: true
    ```

4. Add an extension tag below the "Work Item Extensions" section as shown below to make your control available to work item form. 

     ```xml
        <!--**********************************Work Item Extensions***************************
        ...

        Note: For more information on work item extensions use the following topic:
        http://go.microsoft.com/fwlink/?LinkId=816513
        -->

        <Extensions>
          <Extension Id="AviHadad.Action-Button" />
        </Extensions>

     ```
5. Add two fields to the xml, one for the buttons list, and the second for the convert work item type
        <FIELD name="Button1" refname="Buttons.Button1" type="String" syncnamechanges="true">
            <DEFAULT from="value" value="Convert to Task,Action2" />
        </FIELD>
        <FIELD name="TargetType" refname="Buttons.TargetType" type="String" syncnamechanges="true">
            <DEFAULT from="value" value="Task" />
        </FIELD>
6. Find your extension ID in the "Work Item Extensions" section: 

    ```XML
        <!--**********************************Work Item Extensions***************************

    Extension:
        Name: hitcount-control-dev
        Id: example.hitcount-control-dev
        ...
    ```

7. This extension is a contribution, so you add it with a contribution tag in place of the <Control> tag. This example adds the "ControlContribution" to the "Planning" group.
    ```xml
    <Page Id="Details">
    ...
        <Section>
        ...
            <Group Id="Planning">
            ...
			  <ControlContribution Label="new" Id="AviHadad.Action-Button.ActionButton">
				<Inputs>
					<Input Id="DataTrasfer" Value="Buttons.Button1" />
   					<Input Id="TargetType"  Value="Buttons.TargetType" />
				</Inputs>
			  </ControlContribution>

                <Control Label="Risk" Type="FieldControl" FieldName="Microsoft.VSTS.Common.Risk" />
    ```

8. Finally, import this *.xml* file, using witadmin.
    ```
    witadmin importwitd /collection:CollectionURL /p:Project /f:FileName
    ``` 

## Make changes to the control
 You may (even should) make your own Action, to add functionality to your TFS, by adding more cases in the switch case in the model, and call your own method..... keep your mind on this, the context on the button is the switch case you should handle.
 If you make changes to your extension files, you need to compile the Typescript and create the *.vsix* file again (steps 4-7 in the "Package & Upload to the marketplace" section).
 
Instead of re-installing the extension, you can replace the extension with the new *.vsix* package.  Right-click the extension in the "Manage Extensions" page and click "Update".  You do not need to make changes to your XML file again.

## Make API calls to the work item form service

Reading data from VSTS/TFS server is a common REST API task for a work item control.  The VSS SDK provides a set of services for these REST APIs.  To use the service, import it into the typescript file.

```typescript
import * as VSSService from "VSS/Service";
import * as WitService from "TFS/WorkItemTracking/Services";
import * as ExtensionContracts from "TFS/WorkItemTracking/ExtensionContracts";
import * as Q from "q";
```

To enable Intellisense in Visual Studio Code, include the type definition file *index.d.ts*.  Once you've added this definition file, it shows all functions available in the VSS SDK.
```typescript
/// <reference path="../typings/index.d.ts" />
```

## Commonly Needed
| API                | Functions                   | Usage                                                                     |
| ------------------ | --------------------------- | ------------------------------------------------------------------------- |
| VSSService         | VSS.getConfiguration()      | Returns the XML which defines the work item type.  Used in the sample to read the inputs of the control to describe its behavior.       |
| WitService         | getService()                | Returns an instance of the server to make calls.                     |
|                    | getFieldValue()             | Returns the field's current value.                                    |
|                    | setFieldValue()             | Returns the field's current value using your control.       |
|                    | getAllowedFieldValues()     | Returns the allowed values, or the items in a dropdown, of a field.                                    |


### How to invoke methods on a service call
 Create an instance of the work item service to get information about the work item.  Use one of the service's functions to get information about the field.  This example asks for the allowed values of a field.
```typescript
WitService.WorkItemFormService.getservice().then(
        (service) => {
            service.getAllowedFieldValues(this._fieldName), (allowedValues: string[]) => {
                // do something
            }
        }
)
```

### Recommendation: use Q with service calls
To wait on the response of multiple calls, you can use Q.  This example shows how to ask for the allowed values and the current value associated with a field using the Q.spread function.  You can make two parallel requests, and the code will not be executed until both services have returned a response.

```typescript
WitService.WorkItemFormService.getService().then(
            (service) => {
                Q.spread<any, any>(
                    [service.getAllowedFieldValues(this._fieldName), service.getFieldValue(this._fieldName)],
                    (allowedValues: string[], currentValue: (string | number)) => {
                        //do something
                    }
                )
            }
)
```

### Structure ###

```
/scripts            - Typescript code for extension
/img                - Image assets for extension and description
/typings            - Typescript typings

index.html          - Main entry point
vss-extension.json  - Extension manifest
```

#### Grunt ####

Three basic `grunt` tasks are defined:

* `build` - Compiles TS files in `scripts` folder
* `package-dev` - Builds the development version of the vsix package
* `package-release` - Builds the release version of the vsix package
* `publish-dev` - Publishes the development version of the extension to the marketplace using `tfx-cli`
* `publish-release` - Publishes the release version of the extension to the marketplace using `tfx-cli`

#### VS Code ####

The included `.vscode` config allows you to open and build the project using [VS Code](https://code.visualstudio.com/).

#### Unit Testing ####

The project is setup for unit testing using `mocha`, `chai`, and the `karma` test runner. A simple example unit test is included in `scripts/logic/messageHelper.tests.ts`. To run tests just execute:

```
grunt test
```
