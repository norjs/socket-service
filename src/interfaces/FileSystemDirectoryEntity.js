/**
 *
 * @type {typeof TypeUtils}
 */
const TypeUtils = require("@norjs/utils/Type");

/**
 * Subset of NodeJS File System directory entity object in use by us.
 *
 * @interface
 */
class FileSystemDirectoryEntity {

    /**
     * @returns {boolean}
     */
    isBlockDevice () {}

    /**
     * @returns {boolean}
     */
    isCharacterDevice () {}

    /**
     * @returns {boolean}
     */
    isDirectory () {}

    /**
     * @returns {boolean}
     */
    isFIFO () {}

    /**
     * @returns {boolean}
     */
    isFile () {}

    /**
     * @returns {boolean}
     */
    isSocket () {}

    /**
     * @returns {boolean}
     */
    isSymbolicLink () {}

    /**
     * @returns {string|Buffer}
     */
    get name () {}

}

TypeUtils.defineType(
    "FileSystemDirectoryEntity",
    TypeUtils.classToObjectPropertyTypes(FileSystemDirectoryEntity),
    {
        acceptUndefinedProperties: true
    }
);

/**
 *
 * @type {typeof FileSystemDirectoryEntity}
 */
module.exports = FileSystemDirectoryEntity;
