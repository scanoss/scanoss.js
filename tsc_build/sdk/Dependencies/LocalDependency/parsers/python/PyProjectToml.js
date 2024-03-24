const rProjectTableContent = new RegExp(/\[project\]\s*\n(.*(?:\n(?!^\s*\[).*)*)/g);
const rDependenciesSection = new RegExp(/dependencies\s*=\s*\[((?:[^\]]|\](?!\n))+)\]/);
const purlPrefix = "pkg:pypi/";
const pyProjectToml = async (fileContent, filePath) => {
    const result = { file: filePath, purls: [] };
    const projectTableMatch = fileContent.match(rProjectTableContent);
    if (!projectTableMatch)
        return result;
    const depKeyValueMatch = projectTableMatch[0].match(rDependenciesSection);
    if (!depKeyValueMatch)
        return result;
    const depValue = depKeyValueMatch[1].toString();
    /* At this point, depKeyValue contains the values for dependencies. Example:
    *
    *     "requests",
    *     # this should be ignored
    *     'importlib-metadata; python_version<"3.8"',  #This line as well
    */
    /* The following code will place each dependency in an array (ignoring comments #) */
    const deps = depValue
        .replace(",", "\n") //Convert inline dependencies to new line dependencies
        .split(/\n/) //Generate an array by splitting new lines. Each line contains an independent dependency
        .map(d => d.replace(/(,|"|'|\s|(#.*))/g, "")) // Remove extra spaces, quotes, comments and commas
        .filter(d => d.length !== 0); //Filters those lines that are empty
    deps.forEach(d => {
        d = d.replace(/\;.*/g, ""); //Removes environment markers https://packaging.python.org/en/latest/specifications/dependency-specifiers/#environment-markers
        d = d.replace(/\[.*\]/, ""); //Removes extras https://packaging.python.org/en/latest/specifications/dependency-specifiers/#extras
        const requirementMatch = d.match(/(?:<|<=|!=|==|>=|>|~=|===).*/);
        const requirement = requirementMatch ? requirementMatch[0] : null;
        let purl = d;
        if (requirement)
            purl = d.replace(requirement, "").trim();
        purl = purlPrefix + purl;
        result.purls.push({
            purl,
            ...(requirement !== null && { requirement })
        });
    });
    return result;
};
export default pyProjectToml;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUHlQcm9qZWN0VG9tbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9zZGsvRGVwZW5kZW5jaWVzL0xvY2FsRGVwZW5kZW5jeS9wYXJzZXJzL3B5dGhvbi9QeVByb2plY3RUb21sLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxNQUFNLENBQUMsMENBQTBDLENBQUMsQ0FBQztBQUNwRixNQUFNLG9CQUFvQixHQUFHLElBQUksTUFBTSxDQUFFLDhDQUE4QyxDQUFDLENBQUM7QUFFekYsTUFBTSxVQUFVLEdBQUcsV0FBVyxDQUFDO0FBRS9CLE1BQU0sYUFBYSxHQUFHLEtBQUssRUFBRSxXQUFtQixFQUFDLFFBQWdCLEVBQTZCLEVBQUU7SUFDOUYsTUFBTSxNQUFNLEdBQXFCLEVBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDLENBQUM7SUFFN0QsTUFBTSxpQkFBaUIsR0FBRyxXQUFXLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDbEUsSUFBSSxDQUFDLGlCQUFpQjtRQUFFLE9BQU8sTUFBTSxDQUFDO0lBRXRDLE1BQU0sZ0JBQWdCLEdBQUcsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUM7SUFDMUUsSUFBSSxDQUFDLGdCQUFnQjtRQUFFLE9BQU8sTUFBTSxDQUFDO0lBRXJDLE1BQU0sUUFBUSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRWhEOzs7OztNQUtFO0lBRUYscUZBQXFGO0lBRXJGLE1BQU0sSUFBSSxHQUFJLFFBQVE7U0FDbkIsT0FBTyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxzREFBc0Q7U0FDekUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFJLHdGQUF3RjtTQUN2RyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLG1CQUFtQixFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsbURBQW1EO1NBQ2hHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxDQUFFLENBQUEsQ0FBRSxvQ0FBb0M7SUFHckUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRTtRQUNmLENBQUMsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxFQUFFLENBQUMsQ0FBQSxDQUFFLDhIQUE4SDtRQUMxSixDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLEVBQUUsRUFBRSxDQUFDLENBQUEsQ0FBQyxvR0FBb0c7UUFFaEksTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDakUsTUFBTSxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUE7UUFFakUsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1FBQ2IsSUFBSSxXQUFXO1lBQUUsSUFBSSxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO1FBRTFELElBQUksR0FBRyxVQUFVLEdBQUcsSUFBSSxDQUFDO1FBRXpCLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ2hCLElBQUk7WUFDSixHQUFHLENBQUMsV0FBVyxLQUFLLElBQUksSUFBSSxFQUFFLFdBQVcsRUFBRSxDQUFDO1NBQzdDLENBQUMsQ0FBQTtJQUNKLENBQUMsQ0FBQyxDQUFBO0lBQ0YsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQyxDQUFDO0FBRUYsZUFBZSxhQUFhLENBQUMifQ==